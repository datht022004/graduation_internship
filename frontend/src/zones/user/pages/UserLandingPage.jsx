import { useMemo, useState } from 'react'
import UserHeaderTopBar from '../components/UserHeaderTopBar'
import UserHeaderNav from '../components/UserHeaderNav'
import UserHeroBanner from '../components/UserHeroBanner'
import UserLandingFooter from '../components/UserLandingFooter'
import { USER_LANDING_TABS_MOCK } from '../../../mock/pages/user/user-landing.mock'
import AdsTabPage from './tabs/AdsTabPage'
import BlogTabPage from './tabs/BlogTabPage'
import HomeTabPage from './tabs/HomeTabPage'
import SeoServiceTabPage from './tabs/SeoServiceTabPage'
import WebDesignTabPage from './tabs/WebDesignTabPage'

function renderTabContent(activeTabKey, onChatClick) {
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

    return <HomeTabPage />
}

export default function UserLandingPage({ authUser, onLoginClick, onLogout, onChatClick }) {
    const [activeTabKey, setActiveTabKey] = useState(USER_LANDING_TABS_MOCK[0].key)
    const activeTab = useMemo(
        () => USER_LANDING_TABS_MOCK.find((tab) => tab.key === activeTabKey) ?? USER_LANDING_TABS_MOCK[0],
        [activeTabKey],
    )

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
                    onSelectTab={setActiveTabKey}
                    tabs={USER_LANDING_TABS_MOCK}
                />
            </div>
            <UserHeroBanner onChatClick={onChatClick} tab={activeTab} />

            {renderTabContent(activeTabKey, onChatClick)}

            <UserLandingFooter />
        </>
    )
}
