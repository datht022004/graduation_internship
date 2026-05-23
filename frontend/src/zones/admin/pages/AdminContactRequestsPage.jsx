import { useEffect, useState } from 'react'
import AdminPageHeader from '../components/AdminPageHeader'
import { adminChatGetUsers, adminChatGetUserSessions, adminChatGetSessionDetail } from '../../../config/apiService'

export default function AdminContactRequestsPage() {
    const [viewMode, setViewMode] = useState('users') // 'users' | 'sessions' | 'chat'
    const [users, setUsers] = useState([])
    const [sessions, setSessions] = useState([])
    const [chatDetail, setChatDetail] = useState(null)
    const [loading, setLoading] = useState(true)
    
    const [selectedUser, setSelectedUser] = useState(null)
    const [selectedSession, setSelectedSession] = useState(null)

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const data = await adminChatGetUsers()
            setUsers(data || [])
            setViewMode('users')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchUsers() }, [])

    const handleSelectUser = async (email) => {
        setLoading(true)
        try {
            const data = await adminChatGetUserSessions(email)
            setSessions(data?.sessions || [])
            setSelectedUser(email)
            setViewMode('sessions')
        } finally {
            setLoading(false)
        }
    }

    const handleSelectSession = async (session) => {
        setLoading(true)
        try {
            const data = await adminChatGetSessionDetail(session.session_id)
            setChatDetail(data)
            setSelectedSession(session)
            setViewMode('chat')
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return ''
        const d = new Date(dateString)
        return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <>
            <AdminPageHeader
                title="Lịch sử Chat Khách hàng"
                subtitle="Xem và theo dõi các cuộc trò chuyện của khách hàng với Bot RAG"
                actions={
                    viewMode !== 'users' && (
                        <button 
                            onClick={() => {
                                if (viewMode === 'chat') setViewMode('sessions')
                                else if (viewMode === 'sessions') setViewMode('users')
                            }} 
                            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
                        >
                            Quay lại
                        </button>
                    )
                }
            />
            
            <div className="w-full px-6 py-6 lg:px-8">
                <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm min-h-[500px]">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
                        </div>
                    ) : (
                        <>
                            {/* USERS LIST VIEW */}
                            {viewMode === 'users' && (
                                <div>
                                    <h3 className="mb-4 text-lg font-bold text-slate-800">Khách hàng đã tương tác ({users.length})</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-slate-600">
                                            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                                                <tr>
                                                    <th className="px-4 py-3 rounded-tl-lg">Tài khoản (Email)</th>
                                                    <th className="px-4 py-3">Số lượt Chat (Sessions)</th>
                                                    <th className="px-4 py-3">Hoạt động gần nhất</th>
                                                    <th className="px-4 py-3 rounded-tr-lg text-right">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {users.map(u => (
                                                    <tr key={u.email} className="transition-colors hover:bg-slate-50/50">
                                                        <td className="px-4 py-4 font-medium text-slate-900">{u.email}</td>
                                                        <td className="px-4 py-4">
                                                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{u.session_count} lượt</span>
                                                        </td>
                                                        <td className="px-4 py-4">{formatDate(u.last_active)}</td>
                                                        <td className="px-4 py-4 text-right">
                                                            <button 
                                                                onClick={() => handleSelectUser(u.email)}
                                                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                                                            >
                                                                Xem chi tiết
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {users.length === 0 && (
                                                    <tr>
                                                        <td colSpan="4" className="py-8 text-center text-slate-500">Chưa có khách hàng nào trò chuyện.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* SESSIONS LIST VIEW */}
                            {viewMode === 'sessions' && (
                                <div>
                                    <h3 className="mb-1 text-lg font-bold text-slate-800">Các phiên Chat</h3>
                                    <p className="mb-5 text-sm text-slate-500">Khách hàng: <span className="font-semibold text-slate-800">{selectedUser}</span></p>
                                    
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {sessions.map(s => (
                                            <div 
                                                key={s.session_id} 
                                                onClick={() => handleSelectSession(s)}
                                                className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md"
                                            >
                                                <div className="mb-2 flex items-center justify-between">
                                                    <span className="text-xs font-medium text-slate-400">{formatDate(s.created_at)}</span>
                                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">Đã lưu</span>
                                                </div>
                                                <h4 className="font-semibold text-slate-800 line-clamp-2 group-hover:text-blue-600">{s.title || 'Chat không có tiêu đề'}</h4>
                                                <p className="mt-2 text-xs text-slate-500">ID: {s.session_id.substring(0,8)}...</p>
                                            </div>
                                        ))}
                                        {sessions.length === 0 && (
                                            <div className="col-span-full py-8 text-center text-slate-500">Không tìm thấy phiên chat nào.</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* CHAT MESSAGES VIEW */}
                            {viewMode === 'chat' && chatDetail && (
                                <div className="flex h-[600px] flex-col">
                                    <div className="mb-4 border-b border-slate-200 pb-4">
                                        <h3 className="text-lg font-bold text-slate-800">{chatDetail.title || 'Chi tiết phiên Chat'}</h3>
                                        <p className="text-sm text-slate-500">Khách hàng: <span className="font-semibold text-slate-800">{chatDetail.user_email}</span> | Bắt đầu: {formatDate(chatDetail.created_at)}</p>
                                    </div>
                                    
                                    <div className="flex-1 space-y-4 overflow-y-auto rounded-xl bg-slate-50 p-4">
                                        {chatDetail.messages?.map((msg, idx) => (
                                            <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'}`}>
                                                    <span className="block mb-1 text-[11px] font-bold opacity-70">{msg.role === 'user' ? 'Khách hàng' : 'Bot AI'}</span>
                                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                                </div>
                                            </div>
                                        ))}
                                        {(!chatDetail.messages || chatDetail.messages.length === 0) && (
                                            <div className="flex h-full items-center justify-center text-slate-400">Không có tin nhắn nào trong phiên này.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    )
}
