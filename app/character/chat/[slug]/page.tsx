'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { datadogRum } from '@datadog/browser-rum'
import { apiClient, ensureAuth, getToken, getCommonParams, ACCESS_KEY, generateTraceId } from '@/lib/utils'

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
  category?: string
}

// ── tracking helpers ──────────────────────────────────────────────────────
const getDeviceOs = () => {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'other'
}

const getDeviceOsVersion = () => {
  const ua = navigator.userAgent
  const ios = ua.match(/OS (\d+[_\d]+)/)
  if (ios) return ios[1].replace(/_/g, '.')
  const android = ua.match(/Android (\d+[.\d]*)/)
  return android ? android[1] : 'unknown'
}

const getNetworkType = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conn = (navigator as any).connection
  if (!conn) return 'unknown'
  const t: string = conn.effectiveType || conn.type || ''
  if (/wifi/i.test(t)) return 'wifi'
  if (/5g/i.test(t)) return '5g'
  if (/4g/i.test(t)) return '4g'
  return t || 'unknown'
}

const getLoadTimeMs = () => {
  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    if (nav) return Math.round(nav.domContentLoadedEventEnd)
    return Math.round(performance.now())
  } catch {
    return 0
  }
}

const getUtmParam = (name: string) =>
  new URLSearchParams(window.location.search).get(name) ?? ''

const track = (name: string, attrs: Record<string, unknown>) =>
  datadogRum.addAction(name, attrs)

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

const renderMessageText = (text: string): React.ReactNode => {
  text = text.trim().replace(/\n{3,}/g, '\n\n')
  const parts: React.ReactNode[] = []
  let key = 0
  let lastIndex = 0
  const regex = /\*([^*]+)\*/g
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
    parts.push(<span key={key++} style={{ color: '#888888' }}>{match[0]}</span>)
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex))

  return parts
}

const isServerLimitEvent = (event: string): boolean => {
  let isError = false
  event.split(/\r?\n/).forEach(line => {
    if (line.startsWith('event:') && line.slice(6).trim() === 'error') isError = true
  })
  if (!isError) return false
  return event.includes('"fail":true') || event.includes('limit')
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
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [nsfw, setNsfw] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // tracking timestamps
  const pageViewTimeRef = useRef(Date.now())
  const firstRenderFiredRef = useRef(false)
  const lastUserMsgTimeRef = useRef<number | null>(null)
  const modalShowTimeRef = useRef<number | null>(null)
  const userMsgCountRef = useRef(0)

  const CHAT_COUNT_KEY = 'dl_h5_chat_count'
  const MAX_FREE_CHATS = 5

  const getChatCount = () => parseInt(localStorage.getItem(CHAT_COUNT_KEY) ?? '0', 10)
  const incrementChatCount = () => {
    const next = getChatCount() + 1
    localStorage.setItem(CHAT_COUNT_KEY, String(next))
    return next
  }

  const fetchAutoReply = async (roleId: string) => {
    try {
      const res = await apiClient.post('/user/virtualRole/autoReply', { roleId })
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

        const returningKey = `dl_visited_${slug}`
        const isReturning = !!localStorage.getItem(returningKey)
        localStorage.setItem(returningKey, '1')

        track('landing_page_view', {
          role_id: slug,
          character_name: role.name ?? '',
          character_category: role.category ?? '',
          utm_source: getUtmParam('utm_source'),
          utm_campaign: getUtmParam('p1') || getUtmParam('utm_campaign'),
          utm_ad: getUtmParam('p5') || getUtmParam('utm_ad'),
          device_id: localStorage.getItem('deviceId') ?? '',
          is_returning: isReturning,
          device_os: getDeviceOs(),
          device_os_version: getDeviceOsVersion(),
          network_type: getNetworkType(),
          load_time_ms: getLoadTimeMs(),
          page_url: window.location.href,
        })

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

  // chat_first_render — 首条消息渲染完且输入框可交互
  useEffect(() => {
    if (firstRenderFiredRef.current) return
    if (!authReady || !data || messages.length === 0) return
    firstRenderFiredRef.current = true
    track('chat_first_render', {
      role_id: slug,
      device_id: localStorage.getItem('deviceId') ?? '',
      render_time_ms: Date.now() - pageViewTimeRef.current,
    })
  }, [authReady, data, messages.length, slug])

  // page_leave
  useEffect(() => {
    const onLeave = () => {
      track('page_leave', {
        role_id: slug,
        device_id: localStorage.getItem('deviceId') ?? '',
        messages_sent: userMsgCountRef.current,
        time_on_page_ms: Date.now() - pageViewTimeRef.current,
      })
    }
    window.addEventListener('pagehide', onLeave)
    return () => window.removeEventListener('pagehide', onLeave)
  }, [slug])

  // track modal show time
  useEffect(() => {
    if (showDownloadModal) modalShowTimeRef.current = Date.now()
  }, [showDownloadModal])

  const sendMessage = async (question: string, isQuickReply = false) => {
    if (!authReady || sending || !question) return

    if (getChatCount() >= MAX_FREE_CHATS) {
      setShowDownloadModal(true)
      return
    }

    const now = Date.now()
    userMsgCountRef.current += 1
    track('message_send', {
      role_id: slug,
      device_id: localStorage.getItem('deviceId') ?? '',
      message_index: userMsgCountRef.current,
      is_quick_reply: isQuickReply,
      time_since_prev_msg_ms: lastUserMsgTimeRef.current != null ? now - lastUserMsgTimeRef.current : null,
      time_since_page_view_ms: now - pageViewTimeRef.current,
    })
    lastUserMsgTimeRef.current = now

    setInputValue('')
    setSending(true)
    setSuggestions([])

    // 追加用户消息
    setMessages(prev => [...prev, { role: 'user', text: question }])

    // 追加一条空的角色消息，等待流式填充
    setMessages(prev => [...prev, { role: 'character', text: '', streaming: true }])

    let limitReached = false

    const doFetch = async () => {
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
          'traceId': generateTraceId(),
        },
      })

      if (!response.ok || !response.body) throw new Error('stream error')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      outer: while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split(/\r?\n\r?\n/)
        buffer = events.pop() ?? ''

        for (const event of events) {
          if (isServerLimitEvent(event)) {
            limitReached = true
            break outer
          }
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

      if (!limitReached && isServerLimitEvent(buffer)) limitReached = true

      if (!limitReached) {
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
      }

      if (limitReached) {
        setMessages(prev => {
          const next = [...prev]
          const last = next[next.length - 1]
          if (last?.role === 'character' && last.streaming) {
            next.splice(next.length - 1, 1)
          }
          return next
        })
        setShowDownloadModal(true)
      }
    }

    try {
      await doFetch()
    } catch {
      // 第一次失败，重置气泡内容后重试一次
      setMessages(prev => {
        const next = [...prev]
        const last = next[next.length - 1]
        if (last?.role === 'character' && last.streaming) {
          next[next.length - 1] = { ...last, text: '' }
        }
        return next
      })
      try {
        await doFetch()
      } catch {
        setMessages(prev => {
          const next = [...prev]
          const last = next[next.length - 1]
          if (last?.role === 'character' && last.streaming) {
            next[next.length - 1] = { ...last, text: '...', streaming: false }
          }
          return next
        })
      }
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
      if (limitReached) return
      const count = incrementChatCount()
      if (count >= MAX_FREE_CHATS) {
        setShowDownloadModal(true)
      } else {
        fetchAutoReply(slug)
      }
    }
  }

  const handleSend = () => sendMessage(inputValue.trim())

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
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,8,32,0.3) 0%, rgba(13,8,32,0.55) 50%, rgba(13,8,32,0.85) 100%)' }} />
        </div>
      )}
      {/* 顶部下载横幅 */}
      <div
        className="relative z-10 flex items-center justify-between px-4 py-2 shrink-0 min-h-[60px]"
        style={{ background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <img src="/logo.svg" alt="logo" className="w-9 h-9 rounded-xl shrink-0" />
          <span className="text-white/80 text-sm leading-snug">{t('download_banner')}</span>
        </div>
        <a
          href="https://app.adjust.com/21dm2ei9?engagement_type=fallback_click"
          className="AdjustTracker ml-3 h-11 px-5 rounded-full font-semibold text-sm whitespace-nowrap text-white shrink-0 flex items-center"
          style={{ background: 'linear-gradient(90deg, #a855f7, #7c3aed)' }}
          onClick={() => track('download_entry_click', {
            role_id: slug,
            device_id: localStorage.getItem('deviceId') ?? '',
            store_target: 'app_store',
            time_since_page_view_ms: Date.now() - pageViewTimeRef.current,
          })}
        >
          {t('download_now')}
        </a>
      </div>

      {/* 聊天区域 */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pt-5 pb-4">
        <span className="block font-semibold text-base text-white mb-4">{data.name}</span>
        {/* personalDesc 简介卡片 */}
        {data.personalDesc && (
          <div
            className="mb-5 px-4 py-3 rounded-2xl text-sm leading-relaxed text-white relative"
            style={{ background: '#333333' }}
          >
            <p className={descExpanded ? 'pr-6' : 'line-clamp-3 pr-6'}>
              {data.personalDesc}
            </p>
            <button
              onClick={() => setDescExpanded(v => !v)}
              className="absolute bottom-3 right-4"
            >
              <img
                src="/expand.svg"
                alt={descExpanded ? t('collapse') : t('expand')}
                className="w-4 h-4 transition-transform duration-200"
                style={{ transform: descExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>
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
                className="max-w-[78%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-snug"
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#333333',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.text ? (
                  <>
                    {renderMessageText(msg.text)}
                    {msg.streaming && (
                      <span className="inline-block w-0.5 h-4 bg-white/70 ml-0.5 animate-pulse align-middle" />
                    )}
                  </>
                ) : (
                  msg.streaming && (
                    <span className="inline-flex gap-1.5 items-center h-5">
                      <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  )
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
          background: 'transparent',
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
                onClick={() => sendMessage(s, true)}
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
        {/* 字符计数 */}
        <div className="flex justify-end pr-1">
          <span className="text-xs text-white/50">{inputValue.length}/500</span>
        </div>

        {/* 输入行 */}
        <div className="flex items-center gap-2">
          {/* NSFW 开关 */}
          <div className="flex flex-col items-center gap-0.5 shrink-0">
            <button
              onClick={() => setNsfw(v => !v)}
              className="relative w-11 h-6 rounded-full overflow-hidden transition-colors duration-200"
              style={{ background: nsfw ? 'rgba(168,85,247,0.8)' : 'rgba(255,255,255,0.25)' }}
              aria-label="Toggle NSFW"
            >
              <span
                className="absolute top-0.5 left-0 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                style={{ transform: nsfw ? 'translateX(22px)' : 'translateX(2px)' }}
              />
            </button>
            <span className="text-[10px] text-white/60">NSFW</span>
          </div>

          {/* 输入框 */}
          <div
            className="flex-1 flex items-center rounded-2xl pl-4 pr-1.5 h-12"
            style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={e => e.target.value.length <= 500 && setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              disabled={!authReady || sending}
              maxLength={500}
              placeholder={
                !authReady
                  ? t('placeholder_loading')
                  : sending
                    ? t('placeholder_sending')
                    : t('input_placeholder')
              }
              className="flex-1 bg-transparent text-sm text-white placeholder-white/50 outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-opacity ml-1"
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
        </div>
        <a
          href="https://app.adjust.com/21dm2ei9?engagement_type=fallback_click"
          className="AdjustTracker w-full h-11 rounded-full text-white font-bold text-base tracking-normal flex items-center justify-center"
          style={{ background: 'linear-gradient(90deg, #b020f4 0%, #9b22f2 48%, #a020f0 100%)' }}
        >
          {t('bottom_cta')}
        </a>
      </div>

      {/* 下载引导弹框 */}
      {showDownloadModal && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        >
          <div className="w-full bg-white rounded-3xl px-6 py-8 flex flex-col items-center text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {t('modal_title')}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-7">
              {t('modal_body')}
            </p>
            <a
              href="https://app.adjust.com/21dm2ei9?engagement_type=fallback_click"
              className="AdjustTracker w-full h-12 rounded-full text-white font-semibold text-base flex items-center justify-center"
              style={{ background: 'linear-gradient(90deg, #a855f7, #7c3aed)' }}
              onClick={() => track('conversion_cta_click', {
                role_id: slug,
                device_id: localStorage.getItem('deviceId') ?? '',
                store_target: 'app_store',
                time_since_modal_show_ms: modalShowTimeRef.current != null ? Date.now() - modalShowTimeRef.current : null,
              })}
            >
              {t('modal_cta')}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
