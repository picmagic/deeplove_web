'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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


export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const t = useI18n()
  const slug = params?.slug as string

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authReady, setAuthReady] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

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
    let timer: ReturnType<typeof setTimeout>
    window.location.href = `https://deeplove.onelink.me/prQF?af_xp=social&pid=creator&af_dp=${encodeURIComponent('deeplove://')}&deep_link_value=${encodeURIComponent(`deeplove://role?role=${slug}&source=h5chat`)}`
    timer = setTimeout(() => {
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
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data:')) continue
          const raw = line.slice(5).trim()
          if (!raw || raw === '[DONE]') continue

          let chunk = raw
          try {
            const parsed = JSON.parse(raw)
            // 兼容 {content: "..."} / {text: "..."} / {message: "..."} 格式
            chunk = parsed.content ?? parsed.text ?? parsed.message ?? raw
          } catch {
            // raw 本身就是文本片段
          }

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
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1a0533 0%, #0d0820 60%, #000 100%)' }}
    >
      {/* 顶部下载横幅 */}
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ background: 'rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <span className="text-white/80 text-xs">{t('download_banner') || '立即下载APP，体验完整聊天体验'}</span>
        <button
          onClick={handleDownload}
          className="ml-3 px-3 py-1 rounded-full font-semibold text-xs whitespace-nowrap text-white"
          style={{ background: 'linear-gradient(90deg, #a855f7, #7c3aed)' }}
        >
          {t('download_now') || '立即下载'}
        </button>
      </div>

      {/* Header */}
      <div
        className="flex items-center px-4 py-3 shrink-0"
        style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-full mr-3"
          style={{ background: 'rgba(255,255,255,0.1)' }}
          aria-label={t('back')}
        >
          <img src="/arrow_left.png" alt="back" className="w-4 h-4 invert" />
        </button>
        <div className="relative">
          <img
            src={data.avatarUrl}
            alt={data.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500/40"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#0d0820]" />
        </div>
        <div className="ml-2.5 flex flex-col">
          <span className="font-semibold text-sm text-white">{data.name}</span>
          <span className="text-xs text-white/40">
            {data.age}{data.occupation ? ` · ${data.occupation}` : ''}
          </span>
        </div>
      </div>

      {/* 聊天区域 */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-4">
        {messages.map((msg, i) =>
          msg.role === 'user' ? (
            // 用户消息 - 右侧
            <div key={i} className="flex justify-end mb-5">
              <div
                className="max-w-[72%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed text-white"
                style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}
              >
                {msg.text}
              </div>
            </div>
          ) : (
            // 角色消息 - 左侧
            <div key={i} className="flex items-start mb-5">
              <img
                src={data.avatarUrl}
                alt={data.name}
                className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
              />
              <div className="ml-2.5 max-w-[78%]">
                <div className="text-xs text-white/40 mb-1.5">{data.name}</div>
                <div
                  className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed"
                  style={{
                    background: 'rgba(255,255,255,0.10)',
                    color: 'rgba(255,255,255,0.90)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {msg.text || (msg.streaming && (
                    // 打字光标
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
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* 底部输入栏 */}
      <div
        className="shrink-0 px-4 py-3 flex items-center gap-3"
        style={{
          background: 'rgba(255,255,255,0.04)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          className="flex-1 flex items-center rounded-full px-4 h-11"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.10)',
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
            className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-opacity"
          style={{
            background: canSend
              ? 'linear-gradient(135deg, #a855f7, #7c3aed)'
              : 'rgba(255,255,255,0.12)',
            opacity: canSend ? 1 : 0.45,
          }}
          aria-label="send"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
