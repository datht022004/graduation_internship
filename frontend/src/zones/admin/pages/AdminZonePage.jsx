import { useState } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import { ADMIN_DEFAULT_PAGE } from '../config/navigation'
import AdminOverviewPage from './AdminOverviewPage'
import AdminBlogPage from './AdminBlogPage'
import AdminCategoriesPage from './AdminCategoriesPage'
import AdminDocumentsPage from './AdminDocumentsPage'

function AdminZonePage({ authUser, onLogout, onSwitchToUserZone }) {
    const [activePage, setActivePage] = useState(ADMIN_DEFAULT_PAGE)

    function renderContent() {
        switch (activePage) {
            case 'dashboard':
                return <AdminOverviewPage />
            case 'blog':
                return <AdminBlogPage />
            case 'categories':
                return <AdminCategoriesPage />
            case 'documents':
                return <AdminDocumentsPage />
            default:
                return <AdminOverviewPage />
        }
    }

    return (
        <div className="flex min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50">
            <AdminSidebar
                activePage={activePage}
                onPageChange={setActivePage}
                user={authUser}
                onLogout={onLogout}
                onSwitchToUserZone={onSwitchToUserZone}
            />

            <main className="min-h-screen flex-1 lg:ml-64">{renderContent()}</main>
        </div>
    )
}

export default AdminZonePage
