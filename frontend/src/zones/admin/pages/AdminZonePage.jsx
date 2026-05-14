import { useState } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import { ADMIN_DEFAULT_PAGE } from '../config/navigation'
import AdminOverviewPage from './AdminOverviewPage'
import AdminBlogPage from './AdminBlogPage'
import AdminCategoriesPage from './AdminCategoriesPage'
import AdminDocumentsPage from './AdminDocumentsPage'
import AdminUsersPage from './AdminUsersPage'

function AdminZonePage({ authUser, onLogout, onSwitchToUserZone }) {
    const [activePage, setActivePage] = useState(ADMIN_DEFAULT_PAGE)
    const [blogCategoryShortcut, setBlogCategoryShortcut] = useState(null)

    function handlePageChange(page) {
        if (page !== 'blog') {
            setBlogCategoryShortcut(null)
        }
        setActivePage(page)
    }

    function openBlogCategory(categoryName) {
        setBlogCategoryShortcut({
            category: categoryName,
            requestKey: `${categoryName}-${Date.now()}`,
        })
        setActivePage('blog')
    }

    function renderContent() {
        switch (activePage) {
            case 'dashboard':
                return <AdminOverviewPage onOpenBlogPage={() => handlePageChange('blog')} onOpenBlogCategory={openBlogCategory} />
            case 'blog':
                return <AdminBlogPage categoryShortcut={blogCategoryShortcut} />
            case 'categories':
                return <AdminCategoriesPage />
            case 'users':
                return <AdminUsersPage />
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
                onPageChange={handlePageChange}
                user={authUser}
                onLogout={onLogout}
                onSwitchToUserZone={onSwitchToUserZone}
            />

            <main className="min-h-screen flex-1 lg:ml-64">{renderContent()}</main>
        </div>
    )
}

export default AdminZonePage
