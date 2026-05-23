import { useState } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import { ADMIN_DEFAULT_PAGE } from '../config/navigation'
import AdminOverviewPage from './AdminOverviewPage'
import AdminBlogPage from './AdminBlogPage'
import AdminCategoriesPage from './AdminCategoriesPage'
import AdminDocumentsPage from './AdminDocumentsPage'
import AdminUsersPage from './AdminUsersPage'
import AdminSiteContentPage from './AdminSiteContentPage'
import AdminCompanyProfilePage from './AdminCompanyProfilePage'
import AdminServicePackagesPage from './AdminServicePackagesPage'
import AdminContactRequestsPage from './AdminContactRequestsPage'

function AdminZonePage({ authUser, onLogout }) {
    const [activePage, setActivePage] = useState(() => {
        return sessionStorage.getItem('admin_active_page') || ADMIN_DEFAULT_PAGE
    })
    const [blogCategoryShortcut, setBlogCategoryShortcut] = useState(null)

    function handlePageChange(page) {
        if (page !== 'blog') {
            setBlogCategoryShortcut(null)
        }
        setActivePage(page)
        sessionStorage.setItem('admin_active_page', page)
    }

    function openBlogCategory(categoryName) {
        setBlogCategoryShortcut({
            category: categoryName,
            requestKey: `${categoryName}-${Date.now()}`,
        })
        setActivePage('blog')
        sessionStorage.setItem('admin_active_page', 'blog')
    }

    function renderContent() {
        switch (activePage) {
            case 'dashboard':
                return <AdminOverviewPage onOpenBlogPage={() => handlePageChange('blog')} onOpenBlogCategory={openBlogCategory} />
            case 'blog':
                return <AdminBlogPage categoryShortcut={blogCategoryShortcut} />
            case 'categories':
                return <AdminCategoriesPage onOpenBlogCategory={openBlogCategory} />
            case 'users':
                return <AdminUsersPage />
            case 'documents':
                return <AdminDocumentsPage />
            case 'cms':
                return <AdminSiteContentPage />
            case 'companyProfile':
                return <AdminCompanyProfilePage />
            case 'servicePackages':
                return <AdminServicePackagesPage />
            case 'contactRequests':
                return <AdminContactRequestsPage />
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
            />

            <main className="min-h-screen flex-1 lg:ml-64">{renderContent()}</main>
        </div>
    )
}

export default AdminZonePage
