import { useEffect, useMemo, useRef, useState } from 'react'
import { chatGetSessionById, chatStreamMessage } from '../../../services/apiService'

function buildInitialMessages(userName) {
    return [
        {
            id: 'welcome-1',
            role: 'bot',
            text: `Xin chào ${userName}, mình là trợ lý AI của Nova Business. Bạn muốn tư vấn gói dịch vụ nào?`,
            sources: [],
        },
    ]
}

function getChatStorageKey(user) {
    return user?.email ? `app_chat_session:${user.email}` : ''
}

function mapStoredMessages(messages = []) {
    return messages.map((message, index) => ({
        id: `history-${index}`,
        role: message.role === 'user' ? 'user' : 'bot',
        text: message.content || '',
        sources: [],
    })).filter((message) => message.text)
}

function parseSources(value) {
    try {
        return JSON.parse(value)
    } catch {
        return []
    }
}

async function readChatStream(response, { sessionId, onSessionChange, onTextChange }) {
    if (!response.ok) {
        throw new Error(response.status === 401 ? 'Phiên đăng nhập hết hạn' : `Lỗi server: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullText = ''
    let sources = []
    let buffer = ''
    let nextIsSessionId = false
    let nextIsSources = false
    let activeSessionId = sessionId

    while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
            if (line.startsWith('event: session')) {
                nextIsSessionId = true
                continue
            }

            if (line.startsWith('event: sources')) {
                nextIsSources = true
                continue
            }

            if (line.startsWith('event: done') || !line.startsWith('data: ')) {
                continue
            }

            const payload = line.slice(6)

            if (!payload || payload === '[DONE]') {
                continue
            }

            if (nextIsSessionId) {
                nextIsSessionId = false
                activeSessionId = payload
                onSessionChange?.(payload)
                continue
            }

            if (nextIsSources) {
                nextIsSources = false
                sources = parseSources(payload)
                continue
            }

            fullText += payload
            onTextChange?.(fullText)
        }
    }

    return {
        text: fullText || 'Xin lỗi, tôi không thể trả lời lúc này.',
        sources,
        sessionId: activeSessionId,
    }
}

function RobotIcon({ className = 'h-5 w-5' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24">
            <path d="M12 4V2.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
            <path d="M8 5.5h8a4 4 0 0 1 4 4v5.2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9.5a4 4 0 0 1 4-4Z" fill="currentColor" opacity="0.16" />
            <path d="M8 5.5h8a4 4 0 0 1 4 4v5.2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9.5a4 4 0 0 1 4-4Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
            <path d="M9 12h.01M15 12h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2.6" />
            <path d="M9.2 15.1c1.7 1 3.9 1 5.6 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
            <path d="M4 11H2.5M21.5 11H20" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
            <circle cx="12" cy="2.5" fill="currentColor" r="1.5" />
        </svg>
    )
}

export default function ChatWidget({ user, isOpen, onClose, onExpandedChange }) {
    const initialMessages = useMemo(() => buildInitialMessages(user?.name ?? 'bạn'), [user?.name])
    const [messages, setMessages] = useState(initialMessages)
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [sessionId, setSessionId] = useState(null)
    const [isExpanded, setIsExpanded] = useState(false)
    const messagesEndRef = useRef(null)
    const abortRef = useRef(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        return () => { abortRef.current?.abort() }
    }, [])

    useEffect(() => {
        onExpandedChange?.(isOpen && isExpanded)
    }, [isExpanded, isOpen, onExpandedChange])

    useEffect(() => {
        if (!user) {
            setSessionId(null)
            setMessages(initialMessages)
            return
        }

        const storageKey = getChatStorageKey(user)
        const storedSessionId = localStorage.getItem(storageKey)

        if (!storedSessionId) {
            setSessionId(null)
            setMessages(initialMessages)
            return
        }

        let ignore = false
        setSessionId(storedSessionId)

        chatGetSessionById(storedSessionId)
            .then((session) => {
                if (ignore) return
                const historyMessages = mapStoredMessages(session.messages)
                setMessages(historyMessages.length > 0 ? historyMessages : initialMessages)
            })
            .catch(() => {
                if (ignore) return
                localStorage.removeItem(storageKey)
                setSessionId(null)
                setMessages(initialMessages)
            })

        return () => {
            ignore = true
        }
    }, [initialMessages, user])

    if (!isOpen || !user) {
        return null
    }

    async function handleSend(event) {
        event.preventDefault()
        const trimmed = input.trim()
        if (!trimmed || isLoading) {
            return
        }

        const userMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            text: trimmed,
            sources: [],
        }

        setMessages((prev) => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        const botMsgId = `bot-${Date.now()}`
        setMessages((prev) => [
            ...prev,
            { id: botMsgId, role: 'bot', text: '', sources: [], isStreaming: true },
        ])

        try {
            const abortController = new AbortController()
            abortRef.current = abortController

            const response = await chatStreamMessage({
                message: trimmed,
                sessionId,
                signal: abortController.signal,
            })

            const chatResult = await readChatStream(response, {
                sessionId,
                onSessionChange: setSessionId,
                onTextChange: (text) => {
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === botMsgId ? { ...msg, text } : msg
                        )
                    )
                },
            })

            if (chatResult.sessionId) {
                setSessionId(chatResult.sessionId)
                localStorage.setItem(getChatStorageKey(user), chatResult.sessionId)
            }

            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === botMsgId
                        ? { ...msg, text: chatResult.text, sources: chatResult.sources, isStreaming: false }
                        : msg
                )
            )
        } catch (error) {
            if (error.name !== 'AbortError') {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === botMsgId
                            ? { ...msg, text: `Lỗi: ${error.message}. Vui lòng thử lại.`, isStreaming: false }
                            : msg
                    )
                )
            }
        } finally {
            abortRef.current = null
            setIsLoading(false)
        }
    }

    return (
        <section
            className={`float-in fixed z-50 rounded-[26px] border border-white/55 bg-white/82 p-4 shadow-[0_30px_70px_-20px_rgba(15,23,42,0.35)] backdrop-blur-xl ring-1 ring-slate-900/5 ${isExpanded
                ? 'inset-3 flex max-w-none flex-col md:inset-8'
                : 'bottom-24 right-4 w-[25rem] max-w-[calc(100vw-2rem)]'
                }`}
        >
            <header className="relative mb-4 flex items-center justify-between overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,#111827,#123047_58%,#0e7490)] p-5 text-white shadow-[0_20px_35px_-22px_rgba(8,47,73,0.9)]">
                <div className="absolute inset-x-0 top-0 h-px bg-white/35" />
                <div className="relative z-10 flex items-center gap-3">
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/15 text-cyan-200 shadow-inner ring-1 ring-white/15 backdrop-blur-md">
                        <span className="absolute right-0 top-0 flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        </span>
                        <RobotIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.12em] text-white drop-shadow-md">Trợ lý AI</p>
                        <p className="mt-0.5 text-[11px] font-medium text-cyan-50/80">Đang hỗ trợ: {user.name}</p>
                    </div>
                </div>
                <div className="relative z-10 flex items-center gap-2">
                    <button
                        aria-label={isExpanded ? 'Thu nhỏ khung chat' : 'Phóng to khung chat'}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/12 text-white transition hover:bg-white/25 active:scale-95"
                        onClick={() => setIsExpanded((prev) => !prev)}
                        title={isExpanded ? 'Thu nhỏ' : 'Phóng to'}
                        type="button"
                    >
                        {isExpanded ? (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M8 3v5H3M16 3v5h5M8 21v-5H3M16 21v-5h5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>
                    <button
                        aria-label="Đóng khung chat"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/12 text-white transition hover:bg-white/25 active:scale-95"
                        onClick={onClose}
                        title="Đóng"
                        type="button"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </header>

            <div className={`space-y-4 overflow-y-auto rounded-[22px] border border-slate-200/70 bg-[linear-gradient(180deg,#f8fafc,#eef5f8)] p-4 shadow-inner scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300 ${isExpanded ? 'min-h-0 flex-1' : 'h-[25rem]'}`}>
                {messages.map((message) => (
                    <div className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`} key={message.id}>
                        {message.role === 'bot' && (
                            <div className="mr-2 mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm ring-1 ring-cyan-100">
                                <RobotIcon className="h-5 w-5" />
                            </div>
                        )}
                        <div className="flex flex-col gap-1 max-w-[80%]">
                            <div
                                className={`rounded-[20px] px-4 py-3 text-sm leading-relaxed shadow-sm break-words whitespace-pre-wrap ${message.role === 'bot'
                                    ? 'rounded-tl-md border border-slate-100 bg-white text-slate-700 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.7)]'
                                    : 'rounded-tr-md bg-[linear-gradient(135deg,#06b6d4,#0284c7)] text-white shadow-[0_16px_30px_-22px_rgba(2,132,199,0.9)]'
                                    }`}
                            >
                                {message.text}
                                {message.isStreaming && (
                                    <span className="ml-1 inline-block h-3 w-3 animate-pulse rounded-full bg-current opacity-60" />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form className="relative mt-4" onSubmit={handleSend}>
                <input
                    className="w-full rounded-full border border-slate-200 bg-white py-3 pl-5 pr-14 text-sm font-medium text-slate-800 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.8)] outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 disabled:opacity-60 placeholder:text-slate-400"
                    disabled={isLoading}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={isLoading ? 'Đang phân tích...' : 'Hỏi bất kỳ điều gì...'}
                    value={input}
                />
                <button
                    className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500 text-white shadow-md transition hover:bg-cyan-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                    disabled={isLoading || !input.trim()}
                    type="submit"
                >
                    {isLoading ? (
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
                        </svg>
                    ) : (
                        <svg className="h-4 w-4 -rotate-45 ml-0.5 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                    )}
                </button>
            </form>
        </section>
    )
}
