import { useEffect, useState } from 'react'
import LoginWorkspace from './LoginWorkspace'
import ChatWidget from '../components/ChatWidget'
import UserLandingPage from './UserLandingPage'
import { USER_DEFAULT_PAGE } from '../config/navigation'
import { USER_LANDING_MOCK } from '../../../mock/pages/user/landing.mock'

function UserZonePage({ authUser, onLoginSuccess, onLogout, onRequestAdminZone }) {
    const [activePage] = useState(USER_DEFAULT_PAGE)
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
    const [modalMessage, setModalMessage] = useState('')
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [isChatExpanded, setIsChatExpanded] = useState(false)
    const landingContent = USER_LANDING_MOCK

    useEffect(() => {
        if (!isLoginModalOpen) {
            return undefined
        }

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [isLoginModalOpen])

    const loginRequiredMessage =
        landingContent?.messages?.loginRequired ?? 'Bạn chưa đăng nhập. Vui lòng đăng nhập để bắt đầu chat tư vấn.'
    const loginHintMessage =
        landingContent?.messages?.loginHint ?? 'Vui lòng đăng nhập để sử dụng đầy đủ tính năng.'
    const adminButtonLabel = landingContent?.labels?.adminButton ?? 'Quản lý tài liệu'
    const chatButtonLabel = landingContent?.labels?.chatButton ?? 'Chat ngay'
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

            <ChatWidget
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                onExpandedChange={setIsChatExpanded}
                user={authUser}
            />

            {!isChatExpanded && (
                <button
                    className="chatbot-fab fixed bottom-4 right-3 z-50 flex items-center gap-2 rounded-full bg-[#4285F4] px-2.5 py-2 text-xs font-semibold text-white shadow-[0_14px_34px_rgba(66,133,244,0.4)] transition hover:bg-[#3367D6] sm:bottom-6 sm:right-4 sm:px-3 sm:py-2.5 sm:text-sm"
                    onClick={handleChatClick}
                    type="button"
                >
                    <span className="chatbot-core flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-[#4285F4] sm:h-9 sm:w-9">
                        AI
                    </span>
                    <span className="chatbot-dot inline-block h-2.5 w-2.5 rounded-full bg-emerald-300" />
                    {chatButtonLabel}
                </button>
            )}

            {isLoginModalOpen && (
                <div className="login-modal-backdrop fixed inset-0 z-[90] overflow-y-auto overscroll-contain px-4 py-3 sm:py-5">
                    <div className="mx-auto flex min-h-full w-full max-w-md items-center justify-center">
                        <div className="w-full rounded-[30px]">
                            <div className="mb-3 flex min-h-11 items-start gap-2.5 overflow-hidden rounded-[14px] border border-amber-200 bg-amber-50/95 px-3.5 py-2.5 text-sm font-semibold leading-5 text-amber-800 shadow-[0_16px_32px_-26px_rgba(180,83,9,0.55)]">
                                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white">!</span>
                                <span>{modalMessage}</span>
                            </div>
                            <LoginWorkspace
                                hideHint
                                onClose={() => setIsLoginModalOpen(false)}
                                onLoginSuccess={handleZoneLoginSuccess}
                            />
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

export default UserZonePage
