import { useEffect, useState } from 'react'
import LoginWorkspace from './LoginWorkspace'
import ChatWidget from '../components/ChatWidget'
import UserLandingPage from './UserLandingPage'
import { USER_DEFAULT_PAGE } from '../config/navigation'
import { getUserLandingContent } from '../../../config/api'

function UserZonePage({ authUser, onLoginSuccess, onLogout, onRequestAdminZone }) {
    const [activePage] = useState(USER_DEFAULT_PAGE)
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
    const [modalMessage, setModalMessage] = useState('')
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [landingContent, setLandingContent] = useState(null)

    useEffect(() => {
        let isMounted = true

        async function loadLandingContent() {
            try {
                const data = await getUserLandingContent()
                if (isMounted) {
                    setLandingContent(data)
                }
            } catch (error) {
                console.error('Không thể tải nội dung landing:', error)
            }
        }

        loadLandingContent()
        return () => {
            isMounted = false
        }
    }, [])

    const loginRequiredMessage =
        landingContent?.messages?.loginRequired ?? 'Bạn chưa đăng nhập. Vui lòng đăng nhập để bắt đầu chat tư vấn.'
    const loginHintMessage =
        landingContent?.messages?.loginHint ?? 'Vui lòng đăng nhập để sử dụng đầy đủ tính năng.'
    const adminButtonLabel = landingContent?.labels?.adminButton ?? 'Quản lý tài liệu'
    const chatButtonLabel = landingContent?.labels?.chatButton ?? 'Chat ngay'
    const closeButtonLabel = landingContent?.labels?.closeButton ?? 'Đóng'

    function openLoginModal(message) {
        setModalMessage(message)
        setIsLoginModalOpen(true)
    }

    function handleChatClick() {
        if (!authUser) {
            openLoginModal(loginRequiredMessage)
            return
        }

        setIsChatOpen(true)
    }

    function handleZoneLoginSuccess(user, token) {
        setIsLoginModalOpen(false)
        setModalMessage('')

        if (user.role === 'admin') {
            setIsChatOpen(false)
            onLoginSuccess(user, token)
            onRequestAdminZone()
            return
        }

        setIsChatOpen(true)
        onLoginSuccess(user, token)
    }

    if (activePage !== 'landing') {
        return null
    }

    return (
        <main className="min-h-screen bg-[#efefef]">
            <UserLandingPage
                authUser={authUser}
                onChatClick={handleChatClick}
                onLoginClick={() => openLoginModal(loginHintMessage)}
                onLogout={onLogout}
            />

            {authUser && authUser.role === 'admin' && (
                <button
                    className="fixed bottom-6 left-4 z-50 flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-700"
                    onClick={onRequestAdminZone}
                    type="button"
                >
                    {adminButtonLabel}
                </button>
            )}

            <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} user={authUser} />

            <button
                className="chatbot-fab fixed bottom-6 right-4 z-50 flex items-center gap-2 rounded-full bg-[#4285F4] px-3 py-2.5 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(66,133,244,0.4)] transition hover:bg-[#3367D6]"
                onClick={handleChatClick}
                type="button"
            >
                <span className="chatbot-core flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-bold text-[#4285F4]">
                    AI
                </span>
                <span className="chatbot-dot inline-block h-2.5 w-2.5 rounded-full bg-emerald-300" />
                {chatButtonLabel}
            </button>

            {isLoginModalOpen && (
                <div className="login-modal-backdrop fixed inset-0 z-40 overflow-y-auto px-4 py-4 sm:py-6">
                    <div className="mx-auto flex min-h-full w-full max-w-md items-center justify-center">
                        <div className="w-full">
                            <div className="mb-4 rounded-2xl border border-amber-200/90 bg-amber-50/95 px-4 py-3 text-sm font-medium text-amber-800 shadow-[0_18px_40px_-24px_rgba(180,83,9,0.45)]">
                                {modalMessage}
                            </div>
                            <LoginWorkspace hideHint onLoginSuccess={handleZoneLoginSuccess} />
                            <button
                                className="mt-4 w-full rounded-2xl border border-slate-300/90 bg-white/95 px-4 py-3 text-sm font-bold text-slate-700 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.4)] transition hover:bg-slate-50"
                                onClick={() => setIsLoginModalOpen(false)}
                                type="button"
                            >
                                {closeButtonLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

export default UserZonePage
