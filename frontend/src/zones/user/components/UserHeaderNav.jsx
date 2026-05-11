import { useState, useRef, useEffect } from 'react'

export default function UserHeaderNav({ tabs, activeTabKey, authUser, onLoginClick, onLogout, onChatClick, onSelectTab }) {
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const userMenuRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false)
            }
        }

        if (isUserMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isUserMenuOpen])

    function handleLogoutClick() {
        setIsUserMenuOpen(false)
        setIsLogoutConfirmOpen(true)
    }

    function confirmLogout() {
        setIsLogoutConfirmOpen(false)
        onLogout?.()
    }

    return (
        <>
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex w-full max-w-310 items-center justify-between gap-4 px-4 py-4">
                    <div>
                        <p className="text-4xl font-bold uppercase leading-none tracking-tight text-[#f2682a]">
                            SEO<span className="text-slate-900">vip</span>
                        </p>
                        <p className="text-sm italic text-slate-500">Cùng bạn tỏa sáng</p>
                    </div>

                    <nav className="hidden flex-1 justify-center lg:flex">
                        <ul className="flex items-center gap-8 text-[28px] font-medium text-slate-700">
                            {tabs.map((tab) => (
                                <li key={tab.key}>
                                    <button
                                        className={`cursor-pointer text-base uppercase tracking-wide transition hover:text-[#f2682a] ${activeTabKey === tab.key ? 'text-[#f2682a]' : ''}`}
                                        onClick={() => onSelectTab(tab.key)}
                                        type="button"
                                    >
                                        {tab.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="flex items-center gap-2">
                        <button
                            className="rounded-full bg-[#f68a44] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#e36d22]"
                            onClick={onChatClick}
                            type="button"
                        >
                            Tư vấn miễn phí
                        </button>
                        {authUser ? (
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    aria-label="Thông tin tài khoản"
                                    className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
                                    onClick={() => setIsUserMenuOpen((value) => !value)}
                                    type="button"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0" />
                                    </svg>
                                </button>

                                {isUserMenuOpen && (
                                    <div className="absolute right-0 top-13 z-[70] w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_22px_50px_-24px_rgba(15,23,42,0.55)]">
                                        <div className="mb-4 flex items-center gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-bold text-slate-900">{authUser.name}</p>
                                                <p className="truncate text-xs text-slate-500">{authUser.email}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-slate-500">Vai trò</span>
                                                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold capitalize text-slate-700 ring-1 ring-slate-200">
                                                    {authUser.role}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-slate-500">Trạng thái</span>
                                                <span className="text-xs font-semibold text-emerald-700">Đang đăng nhập</span>
                                            </div>
                                        </div>

                                        <button
                                            className="mt-4 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
                                            onClick={handleLogoutClick}
                                            type="button"
                                        >
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#f2682a] hover:text-[#f2682a]"
                                onClick={onLoginClick}
                                type="button"
                            >
                                Đăng nhập
                            </button>
                        )}
                    </div>
                </div>

                <div className="mx-auto w-full max-w-310 px-4 pb-4 lg:hidden">
                    <div className="no-scrollbar -mx-1 overflow-x-auto">
                        <div className="flex min-w-max gap-2 px-1">
                            {tabs.map((tab) => (
                                <button
                                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${activeTabKey === tab.key
                                        ? 'border-[#f2682a] bg-[#fff2ea] text-[#f2682a]'
                                        : 'border-slate-200 bg-white text-slate-600'
                                        }`}
                                    key={tab.key}
                                    onClick={() => onSelectTab(tab.key)}
                                    type="button"
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {isLogoutConfirmOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-2xl border border-white/70 bg-white p-5 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.65)]">
                        <div className="mb-5">
                            <p className="text-lg font-bold text-slate-900">Xác nhận đăng xuất</p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Bạn có chắc chắn muốn đăng xuất khỏi tài khoản {authUser?.name}?
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                onClick={() => setIsLogoutConfirmOpen(false)}
                                type="button"
                            >
                                Hủy
                            </button>
                            <button
                                className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
                                onClick={confirmLogout}
                                type="button"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
