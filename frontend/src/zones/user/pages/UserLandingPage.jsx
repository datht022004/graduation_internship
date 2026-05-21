import { useEffect, useMemo, useState } from 'react'
import UserHeaderTopBar from '../components/UserHeaderTopBar'
import UserHeaderNav from '../components/UserHeaderNav'
import UserHeroBanner from '../components/UserHeroBanner'
import UserLandingFooter from '../components/UserLandingFooter'
import { USER_LANDING_TABS_MOCK } from '../../../mock/pages/user/user-landing.mock'
import BlogDetailPage from './tabs/BlogDetailPage'
import AdsTabPage from './tabs/AdsTabPage'
import BlogTabPage from './tabs/BlogTabPage'
import HomeTabPage from './tabs/HomeTabPage'
import SeoServiceTabPage from './tabs/SeoServiceTabPage'
import WebDesignTabPage from './tabs/WebDesignTabPage'
import CompanyProfilePage from './tabs/CompanyProfilePage'

function renderTabContent(activeTabKey, onChatClick, onSelectTab) {
    if (activeTabKey === 'seo-service') {
        return <SeoServiceTabPage onChatClick={onChatClick} />
    }

    if (activeTabKey === 'web-design') {
        return <WebDesignTabPage onChatClick={onChatClick} />
    }

    if (activeTabKey === 'ads') {
        return <AdsTabPage onChatClick={onChatClick} />
    }

    if (activeTabKey === 'blog') {
        return <BlogTabPage />
    }

    return <HomeTabPage onSelectTab={onSelectTab} />
}

export default function UserLandingPage({ authUser, onLoginClick, onLogout, onChatClick }) {
    const [activeTabKey, setActiveTabKey] = useState(USER_LANDING_TABS_MOCK[0].key)
    const [selectedPost, setSelectedPost] = useState(null)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const activeTab = useMemo(
        () => USER_LANDING_TABS_MOCK.find((tab) => tab.key === activeTabKey) ?? USER_LANDING_TABS_MOCK[0],
        [activeTabKey],
    )

    const handleSetTab = (key) => {
        if (key === activeTabKey && !selectedPost && !isProfileOpen) return
        setIsTransitioning(true)
        setTimeout(() => {
            setActiveTabKey(key)
            setSelectedPost(null)
            setIsProfileOpen(false)
            window.scrollTo({ top: 0, behavior: 'instant' })
            setTimeout(() => setIsTransitioning(false), 500)
        }, 400)
    }

    const handleOpenPost = (post) => {
        setIsTransitioning(true)
        setTimeout(() => {
            setSelectedPost(post)
            setIsProfileOpen(false)
            window.scrollTo({ top: 0, behavior: 'instant' })
            setTimeout(() => setIsTransitioning(false), 500)
        }, 400)
    }

    const handleOpenProfile = (isOpen) => {
        setIsTransitioning(true)
        setTimeout(() => {
            setIsProfileOpen(isOpen)
            if (isOpen) setSelectedPost(null)
            window.scrollTo({ top: 0, behavior: 'instant' })
            setTimeout(() => setIsTransitioning(false), 500)
        }, 400)
    }

    useEffect(() => {
        function handleOpenPostEvent(e) {
            handleOpenPost(e.detail)
        }
        function handleChangeTab(e) {
            handleSetTab(e.detail)
        }
        window.addEventListener('open-blog-post', handleOpenPostEvent)
        window.addEventListener('change-tab', handleChangeTab)
        return () => {
            window.removeEventListener('open-blog-post', handleOpenPostEvent)
            window.removeEventListener('change-tab', handleChangeTab)
        }
    }, [activeTabKey, selectedPost, isProfileOpen])

    return (
        <>
            <div className="sticky top-0 z-50 bg-white shadow-sm">
                <UserHeaderTopBar />
                <UserHeaderNav
                    activeTabKey={activeTabKey}
                    authUser={authUser}
                    onChatClick={onChatClick}
                    onLoginClick={onLoginClick}
                    onLogout={onLogout}
                    onSelectTab={handleSetTab}
                    tabs={USER_LANDING_TABS_MOCK}
                />
            </div>
            {!selectedPost && !isProfileOpen && <UserHeroBanner onChatClick={onChatClick} tab={activeTab} onOpenProfile={() => handleOpenProfile(true)} />}

            {selectedPost ? (
                <BlogDetailPage post={selectedPost} onBack={() => handleOpenPost(null)} />
            ) : isProfileOpen ? (
                <CompanyProfilePage onBack={() => handleOpenProfile(false)} />
            ) : (
                renderTabContent(activeTabKey, onChatClick, handleSetTab)
            )}

            <UserLandingFooter />

            {/* Global Loading Overlay */}
            {isTransitioning && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in">
                    <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-200">
                        <div className="relative flex h-16 w-16 items-center justify-center">
                            <span className="absolute inset-0 animate-ping rounded-full border-2 border-[#f2682a] opacity-20"></span>
                            <span className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-t-[#f2682a] border-r-[#f2682a]"></span>
                            <span className="h-2 w-2 rounded-full bg-[#f2682a]"></span>
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Đang tải trang...</p>
                    </div>
                </div>
            )}
        </>
    )
}
