import { useEffect, useMemo, useRef, useState } from 'react'
import { getChatSession, streamChatMessage } from '../../../config/api'

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

export default function ChatWidget({ user, isOpen, onClose }) {
    const initialMessages = useMemo(() => buildInitialMessages(user?.name ?? 'bạn'), [user?.name])
    const [messages, setMessages] = useState(initialMessages)
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [sessionId, setSessionId] = useState(null)
    const messagesEndRef = useRef(null)
    const abortRef = useRef(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        return () => { abortRef.current?.abort() }
    }, [])

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

        getChatSession(storedSessionId)
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

            const response = await streamChatMessage({
                message: trimmed,
                sessionId,
                signal: abortController.signal,
                onSessionChange: setSessionId,
                onTextChange: (text) => {
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === botMsgId ? { ...msg, text } : msg
                        )
                    )
                },
            })

            if (response.sessionId) {
                setSessionId(response.sessionId)
                localStorage.setItem(getChatStorageKey(user), response.sessionId)
            }

            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === botMsgId
                        ? { ...msg, text: response.text, sources: response.sources, isStreaming: false }
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
        <section className="float-in fixed bottom-24 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-[28px] border border-white/40 bg-white/70 p-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] backdrop-blur-xl ring-1 ring-slate-900/5">
            <header className="relative mb-4 flex items-center justify-between overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#0f172a,#1e293b)] p-5 text-white shadow-lg">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/20 blur-2xl" />
                <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-orange-400/20 blur-2xl" />
                <div className="relative z-10 flex items-center gap-3">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 shadow-inner backdrop-blur-md">
                        <span className="absolute right-0 top-0 flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        </span>
                        <svg className="h-5 w-5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    </div>
                    <div>
                        <p className="text-sm font-black uppercase tracking-wider text-white drop-shadow-md">Trợ lý AI</p>
                        <p className="text-[11px] font-medium text-slate-300">Đang hỗ trợ: {user.name}</p>
                    </div>
                </div>
                <button
                    className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 active:scale-95"
                    onClick={onClose}
                    type="button"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </header>

            <div className="h-96 space-y-4 overflow-y-auto rounded-[20px] bg-slate-50/50 p-4 shadow-inner ring-1 ring-slate-100 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200">
                {messages.map((message) => (
                    <div className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`} key={message.id}>
                        {message.role === 'bot' && (
                            <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-600 shadow-sm">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                            </div>
                        )}
                        <div className="flex flex-col gap-1 max-w-[80%]">
                            <div
                                className={`rounded-[20px] px-4 py-3 text-sm leading-relaxed shadow-sm break-words whitespace-pre-wrap ${message.role === 'bot'
                                    ? 'bg-white rounded-tl-sm border border-slate-100 text-slate-700'
                                    : 'bg-[linear-gradient(135deg,#0ea5e9,#0284c7)] rounded-tr-sm text-white'
                                    }`}
                            >
                                {message.text}
                                {message.isStreaming && (
                                    <span className="ml-1 inline-block h-3 w-3 animate-pulse rounded-full bg-current opacity-60" />
                                )}
                            </div>
                            {message.sources && message.sources.length > 0 && (
                                <div className="mt-1 space-y-1 pl-2">
                                    {message.sources.map((source, idx) => (
                                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 transition-colors hover:text-cyan-600 cursor-pointer" key={idx}>
                                            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                            </svg>
                                            <span>{source.filename}{source.page != null ? ` (tr.${source.page})` : ''}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form className="relative mt-4" onSubmit={handleSend}>
                <input
                    className="w-full rounded-full border border-slate-200 bg-white/80 py-3 pl-5 pr-14 text-sm text-slate-800 shadow-sm backdrop-blur-sm outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50 disabled:opacity-60 placeholder:text-slate-400 font-medium"
                    disabled={isLoading}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={isLoading ? 'Đang phân tích...' : 'Hỏi bất kỳ điều gì...'}
                    value={input}
                />
                <button
                    className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500 text-white shadow-md transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
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
