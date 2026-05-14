import { useEffect, useState } from 'react'
import AdminPageHeader from '../components/AdminPageHeader'
import AdminStatCard from '../components/AdminStatCard'
import { getAdminDocuments, getBlogPosts, getCategories } from '../../../config/api'

export default function AdminOverviewPage() {
    const [stats, setStats] = useState({ blogs: 0, categories: 0, documents: 0 })
    const [recentBlogs, setRecentBlogs] = useState([])
    const [recentCategories, setRecentCategories] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            setLoading(true)
            try {
                const [blogs, categories, documents] = await Promise.all([
                    getBlogPosts(),
                    getCategories(),
                    getAdminDocuments(),
                ])
                setStats({
                    blogs: blogs.length,
                    categories: categories.length,
                    documents: documents.length,
                })
                setRecentBlogs(blogs.slice(0, 3))
                setRecentCategories(categories.slice(0, 5))
            } catch (error) {
                console.error('Lỗi tải thống kê:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    return (
        <>
            <AdminPageHeader title="Dashboard" subtitle="Tổng quan Blog, Danh mục và dữ liệu RAG" />

            <div className="w-full px-6 py-6 lg:px-8">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <svg className="h-6 w-6 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                            <AdminStatCard
                                label="Bài viết blog"
                                value={stats.blogs}
                                color="rose"
                                icon={
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                    </svg>
                                }
                            />
                            <AdminStatCard
                                label="Danh mục"
                                value={stats.categories}
                                color="emerald"
                                icon={
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.169.659 1.591l8.432 8.432a2.25 2.25 0 003.182 0l4.318-4.318a2.25 2.25 0 000-3.182L11.159 3.659A2.25 2.25 0 009.568 3z" />
                                    </svg>
                                }
                            />
                            <AdminStatCard
                                label="Tài liệu RAG"
                                value={stats.documents}
                                color="blue"
                                icon={
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                }
                            />
                        </div>

                        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                            <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
                                <h2 className="mb-5 text-xl font-bold text-slate-800">Bài viết gần đây</h2>
                                {recentBlogs.length === 0 ? (
                                    <p className="text-base text-slate-400">Chưa có bài viết nào</p>
                                ) : (
                                    <div className="divide-y divide-slate-200">
                                        {recentBlogs.map((post) => (
                                            <div key={post.id} className="flex items-center justify-between py-4">
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-base font-semibold text-slate-700">{post.title}</p>
                                                    <p className="mt-1 text-sm text-slate-400">
                                                        {post.category} · {post.readTime}
                                                    </p>
                                                </div>
                                                {post.isFeatured && (
                                                    <span className="ml-3 shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700">
                                                        Nổi bật
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
                                <h2 className="mb-5 text-xl font-bold text-slate-800">Danh mục</h2>
                                {recentCategories.length === 0 ? (
                                    <p className="text-base text-slate-400">Chưa có danh mục nào</p>
                                ) : (
                                    <div className="space-y-3">
                                        {recentCategories.map((category) => (
                                            <div key={category.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                                <span className="truncate text-base font-semibold text-slate-700">{category.name}</span>
                                                <span className="rounded-full bg-white px-2.5 py-1 text-sm font-bold text-slate-500">{category.postCount}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    )
}
