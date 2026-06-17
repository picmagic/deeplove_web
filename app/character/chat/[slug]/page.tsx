'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { apiClient, ensureAuth, getToken, getCommonParams, ACCESS_KEY } from '@/lib/utils'

const getLang = () => {
  if (typeof window === 'undefined') return 'zh-TW'
  const lang = navigator.language || 'zh-TW'
  if (lang.startsWith('zh')) {
    if (lang.includes('Hant') || lang.includes('TW')) return 'zh-TW'
    return 'zh-CN'
  }
  return lang.split('-')[0]
}

const loadLocale = async (lang: string) => {
  try {
    const res = await fetch(`/locales/${lang}.json`)
    if (!res.ok) throw new Error('not found')
    return await res.json()
  } catch {
    const res = await fetch(`/locales/zh-TW.json`)
    return await res.json()
  }
}

const useI18n = () => {
  const [dict, setDict] = useState<Record<string, string>>({})
  useEffect(() => {
    loadLocale(getLang()).then(setDict)
  }, [])
  return (key: string) => dict[key] || key
}

interface Message {
  role: 'character' | 'user'
  text: string
  streaming?: boolean
}

interface CharacterData {
  avatarUrl?: string
  name?: string
  age?: string | number
  occupation?: string
  prefAnswer?: string
  personalDesc?: string
}

const extractDeltaContent = (payload: unknown): string => {
  if (typeof payload === 'string') return payload

  if (Array.isArray(payload)) {
    return payload.map(extractDeltaContent).join('')
  }

  if (!payload || typeof payload !== 'object') return ''

  const data = payload as {
    data?: unknown
    message?: unknown
    choices?: unknown
    delta?: { content?: unknown }
    content?: unknown
    text?: unknown
  }

  if (typeof data.delta?.content === 'string') return data.delta.content
  if (typeof data.content === 'string') return data.content
  if (typeof data.text === 'string') return data.text

  if (data.data !== undefined) return extractDeltaContent(data.data)
  if (data.message !== undefined) return extractDeltaContent(data.message)
  if (data.choices !== undefined) return extractDeltaContent(data.choices)
  if (data.content !== undefined) return extractDeltaContent(data.content)
  if (data.text !== undefined) return extractDeltaContent(data.text)

  return ''
}

const getMessageChunk = (raw: string, eventType?: string) => {
  try {
    const parsed = JSON.parse(raw) as {
      type?: string
      data?: unknown
      message?: unknown
      choices?: unknown
      content?: unknown
      text?: unknown
    }
    const type = eventType || parsed.type

    if (type !== 'message') return ''

    return extractDeltaContent(
      parsed.data ??
      parsed.message ??
      parsed.choices ??
      parsed.content ??
      parsed.text ??
      parsed
    )
  } catch {
    return eventType === 'message' ? raw : ''
  }
}

const parseStreamEvent = (event: string) => {
  let eventType = ''
  const dataLines: string[] = []

  event.split(/\r?\n/).forEach(line => {
    if (line.startsWith('event:')) {
      eventType = line.slice(6).trim()
      return
    }

    if (line.startsWith('type:')) {
      eventType = line.slice(5).trim()
      return
    }

    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim())
    }
  })

  const raw = dataLines.join('\n').trim()
  if (!raw || raw === '[DONE]') return ''

  return getMessageChunk(raw, eventType)
}


export default function ChatPage() {
  const params = useParams()
  const t = useI18n()
  const slug = params?.slug as string

  const [data, setData] = useState<CharacterData | null>(null)
  const [loading, setLoading] = useState(true)
  const [authReady, setAuthReady] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [sending, setSending] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchAutoReply = async (roleId: string) => {
    try {
      const res = await apiClient.get('/user/virtualRole/autoReply', {
        params: { roleId },
      })
      const list: string[] = res.data?.data ?? []
      setSuggestions(list.filter(Boolean).slice(0, 2))
    } catch {
      // 静默失败，不影响聊天
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        await ensureAuth()
        setAuthReady(true)

        const res = await apiClient.get('/user/virtualRole/detail', {
          params: { roleId: slug },
        })
        const role = res.data.data
        setData(role)

        if (role.prefAnswer) {
          setMessages([{ role: 'character', text: role.prefAnswer }])
          fetchAutoReply(slug)
        }
      } catch {
        setAuthReady(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleDownload = () => {
    window.location.href = `https://deeplove.onelink.me/prQF?af_xp=social&pid=creator&af_dp=${encodeURIComponent('deeplove://')}&deep_link_value=${encodeURIComponent(`deeplove://role?role=${slug}&source=h5chat`)}`
    const timer = setTimeout(() => {
      if (!document.hidden) {
        window.location.href = 'https://apps.apple.com/app/id6741785278'
      }
    }, 3000)
    document.addEventListener('visibilitychange', function handler() {
      if (document.hidden) {
        clearTimeout(timer)
        document.removeEventListener('visibilitychange', handler)
      }
    })
  }

  const handleSend = async () => {
    const question = inputValue.trim()
    if (!authReady || sending || !question) return

    setInputValue('')
    setSending(true)
    setSuggestions([])

    // 追加用户消息
    setMessages(prev => [...prev, { role: 'user', text: question }])

    // 追加一条空的角色消息，等待流式填充
    setMessages(prev => [...prev, { role: 'character', text: '', streaming: true }])

    try {
      const url = new URL(`/api/proxy/${ACCESS_KEY}/user/virtualRole/step-chat`, window.location.origin)
      url.searchParams.set('chatType', '1')
      url.searchParams.set('question', question)
      url.searchParams.set('roleId', slug)

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getToken() ?? ''}`,
          'YY-Basic-Params': JSON.stringify(getCommonParams()),
          'Accept': 'text/event-stream',
        },
      })

      if (!response.ok || !response.body) throw new Error('stream error')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split(/\r?\n\r?\n/)
        buffer = events.pop() ?? ''

        for (const event of events) {
          const chunk = parseStreamEvent(event)
          if (!chunk) continue

          setMessages(prev => {
            const next = [...prev]
            const last = next[next.length - 1]
            if (last?.role === 'character') {
              next[next.length - 1] = { ...last, text: last.text + chunk }
            }
            return next
          })
        }
      }

      const trailingChunk = parseStreamEvent(buffer)
      if (trailingChunk) {
        setMessages(prev => {
          const next = [...prev]
          const last = next[next.length - 1]
          if (last?.role === 'character') {
            next[next.length - 1] = { ...last, text: last.text + trailingChunk }
          }
          return next
        })
      }
    } catch {
      // 流失败时在最后一条消息填入错误提示
      setMessages(prev => {
        const next = [...prev]
        const last = next[next.length - 1]
        if (last?.role === 'character' && last.streaming) {
          next[next.length - 1] = { ...last, text: '...', streaming: false }
        }
        return next
      })
    } finally {
      // 结束 streaming 状态
      setMessages(prev => {
        const next = [...prev]
        const last = next[next.length - 1]
        if (last?.role === 'character' && last.streaming) {
          next[next.length - 1] = { ...last, streaming: false }
        }
        return next
      })
      setSending(false)
      fetchAutoReply(slug)
    }
  }

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ background: 'linear-gradient(160deg, #1a0533 0%, #0d0820 60%, #000 100%)' }}
      >
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div
        className="flex items-center justify-center h-screen text-red-400"
        style={{ background: 'linear-gradient(160deg, #1a0533 0%, #0d0820 60%, #000 100%)' }}
      >
        No Data
      </div>
    )
  }

  const canSend = authReady && !sending && inputValue.trim().length > 0

  return (
    <div
      className="flex flex-col h-screen overflow-hidden relative"
      style={{ background: '#0d0820' }}
    >
      {/* 背景图 */}
      {data.avatarUrl && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${data.avatarUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        >
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,8,32,0.55) 0%, rgba(13,8,32,0.82) 50%, rgba(13,8,32,0.97) 100%)' }} />
        </div>
      )}
      {/* 顶部下载横幅 */}
      <div
        className="relative z-10 flex items-center justify-between px-4 py-2 shrink-0 min-h-[60px]"
        style={{ background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <img src="/logo.svg" alt="logo" className="w-9 h-9 rounded-xl shrink-0" />
          <span className="text-white/80 text-sm leading-snug">立即下载APP，体验完整聊天体验</span>
        </div>
        <button
          onClick={handleDownload}
          className="ml-3 h-11 px-5 rounded-full font-semibold text-sm whitespace-nowrap text-white shrink-0"
          style={{ background: 'linear-gradient(90deg, #a855f7, #7c3aed)' }}
        >
          {t('download_now') || '立即下载'}
        </button>
      </div>

      {/* Header */}
      <div
        className="relative z-10 flex items-center px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="font-semibold text-base text-white">{data.name}</span>
      </div>

      {/* 聊天区域 */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pt-5 pb-4">
        {/* personalDesc 简介卡片 */}
        {data.personalDesc && (
          <div
            className="mb-5 px-4 py-3 rounded-2xl text-sm leading-relaxed text-white"
            style={{
              background: '#333333',
            }}
          >
            <p className={descExpanded ? undefined : 'line-clamp-3'}>
              {data.personalDesc}
            </p>
            {!descExpanded && (
              <button
                onClick={() => setDescExpanded(true)}
                className="mt-1 text-xs text-white/50 transition-colors"
              >
                展开
              </button>
            )}
          </div>
        )}

        {messages.map((msg, i) =>
          msg.role === 'user' ? (
            // 用户消息 - 右侧
            <div key={i} className="flex justify-end mb-4">
              <div
                className="max-w-[72%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed text-white"
                style={{ background: 'rgba(120,60,200,0.55)', backdropFilter: 'blur(8px)', border: '1px solid rgba(168,85,247,0.3)' }}
              >
                {msg.text}
              </div>
            </div>
          ) : (
            // 角色消息 - 左侧（无头像、无名字）
            <div key={i} className="flex justify-start mb-4">
              <div
                className="max-w-[78%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed text-white"
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                {msg.text || (msg.streaming && (
                  <span className="inline-flex gap-1 items-center h-4">
                    <span className="w-1 h-1 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-1 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-1 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                ))}
                {msg.streaming && msg.text && (
                  <span className="inline-block w-0.5 h-4 bg-white/70 ml-0.5 animate-pulse align-middle" />
                )}
              </div>
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* 底部输入栏 */}
      <div
        className="relative z-10 shrink-0 px-4 pt-3 flex flex-col gap-2"
        style={{
          background: 'rgba(255,255,255,0.04)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        }}
      >
        {/* 自动回复建议 */}
        {suggestions.length > 0 && (
          <div className="flex flex-col gap-2 pb-1">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setInputValue(s)
                  setSuggestions([])
                }}
                className="w-full text-left px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={{
                  background: 'rgba(255,255,255,0.82)',
                  backdropFilter: 'blur(10px)',
                  color: '#333333',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div
          className="flex items-center rounded-full pl-4 pr-1.5 h-12"
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.30)',
          }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={!authReady || sending}
            placeholder={
              !authReady
                ? '初始化中...'
                : sending
                  ? '回复中...'
                  : (t('input_placeholder') || '发送消息...')
            }
            className="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-opacity ml-2"
            style={{
              background: canSend
                ? 'linear-gradient(135deg, #a855f7, #7c3aed)'
                : 'rgba(255,255,255,0.15)',
              opacity: canSend ? 1 : 0.5,
            }}
            aria-label="send"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <button
          onClick={handleDownload}
          className="w-full h-11 rounded-full text-white font-bold text-base tracking-normal"
          style={{ background: 'linear-gradient(90deg, #b020f4 0%, #9b22f2 48%, #a020f0 100%)' }}
        >
          更刺激的剧情，在 App 里解锁
        </button>
      </div>
    </div>
  )
}
