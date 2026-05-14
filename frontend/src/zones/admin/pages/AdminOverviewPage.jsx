import { useEffect, useState } from 'react'
import AdminPageHeader from '../components/AdminPageHeader'
import AdminStatCard from '../components/AdminStatCard'
import { getAdminDocumentPage, getBlogPostPage, getCategoryPage } from '../../../config/api'

export default function AdminOverviewPage({ onOpenBlogPage }) {
    const [stats, setStats] = useState({ blogs: 0, categories: 0, documents: 0 })
    const [recentBlogs, setRecentBlogs] = useState([])
    const [recentCategories, setRecentCategories] = useState([])
    const [selectedPost, setSelectedPost] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            setLoading(true)
            try {
                const [blogPage, categoryPage, documentPage] = await Promise.all([
                    getBlogPostPage({ pageSize: 3 }),
                    getCategoryPage({ pageSize: 5 }),
                    getAdminDocumentPage({ pageSize: 1 }),
                ])
                setStats({
                    blogs: blogPage.total,
                    categories: categoryPage.total,
                    documents: documentPage.total,
                })
                setRecentBlogs(blogPage.items || [])
                setRecentCategories(categoryPage.items || [])
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
                                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                    <h2 className="text-xl font-bold text-slate-800">Bài viết gần đây</h2>
                                    <button
                                        type="button"
                                        onClick={onOpenBlogPage}
                                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                    >
                                        Quản lý tất cả
                                    </button>
                                </div>
                                {recentBlogs.length === 0 ? (
                                    <p className="text-base text-slate-400">Chưa có bài viết nào</p>
                                ) : (
                                    <div className="space-y-2">
                                        {recentBlogs.map((post) => (
                                            <button
                                                key={post.id}
                                                type="button"
                                                onClick={() => setSelectedPost(post)}
                                                className="group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-blue-300 hover:bg-blue-600/50 hover:shadow-sm"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-base font-semibold text-slate-700 transition-colors group-hover:text-blue-950">{post.title}</p>
                                                    <p className="mt-1 text-sm text-slate-400 transition-colors group-hover:text-blue-900/80">{post.category}</p>
                                                </div>
                                                <div className="ml-3 flex shrink-0 items-center gap-2">
                                                    {post.isFeatured && (
                                                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700 transition-colors group-hover:bg-amber-100 group-hover:text-amber-800">
                                                            Nổi bật
                                                        </span>
                                                    )}
                                                    <span className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 transition-colors group-hover:border-blue-200 group-hover:bg-white/70 group-hover:text-blue-800">
                                                        Xem chi tiết
                                                    </span>
                                                </div>
                                            </button>
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
                                        {recentCategories.map((category, index) => {
                                            const tone = CATEGORY_TONES[index % CATEGORY_TONES.length]
                                            return (
                                            <div key={category.id} className={`flex items-center justify-between rounded-xl border px-4 py-3 ${tone.item}`}>
                                                <span className={`truncate text-base font-semibold ${tone.text}`}>{category.name}</span>
                                                <span className={`rounded-full px-2.5 py-1 text-sm font-bold ${tone.badge}`}>{category.postCount}</span>
                                            </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
            {selectedPost && (
                <BlogPostPreviewModal post={selectedPost} onClose={() => setSelectedPost(null)} />
            )}
        </>
    )
}

function BlogPostPreviewModal({ post, onClose }) {
    const content = sanitizeBlogHtml(post.content || `<p>${escapeHtml(post.excerpt || '')}</p>`)
    const tags = (post.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
            <article className="relative max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-lg transition-colors hover:bg-white hover:text-slate-900"
                    aria-label="Đóng bài viết"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="max-h-[92vh] overflow-y-auto">
                    {post.imageUrl && (
                        <img src={post.imageUrl} alt="" className="h-64 w-full object-cover md:h-80" />
                    )}
                    <div className="px-6 py-8 md:px-10 md:py-10">
                        <div className="mb-5 flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">{post.category}</span>
                            {post.author && <span className="text-xs font-bold uppercase tracking-wide text-slate-400">{post.author}</span>}
                        </div>
                        <h2 className="text-3xl font-black leading-tight text-slate-950 md:text-5xl">{post.title}</h2>
                        {post.excerpt && <p className="mt-5 text-lg leading-8 text-slate-600">{post.excerpt}</p>}
                        {tags.length > 0 && (
                            <div className="mt-5 flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <span key={tag} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="blog-content mt-8 border-t border-slate-200 pt-8" dangerouslySetInnerHTML={{ __html: content }} />
                    </div>
                </div>
            </article>
        </div>
    )
}

function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

function sanitizeBlogHtml(html) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    doc.querySelectorAll('script, style, iframe, object, embed').forEach((node) => node.remove())
    doc.body.querySelectorAll('*').forEach((node) => {
        Array.from(node.attributes).forEach((attr) => {
            const name = attr.name.toLowerCase()
            const value = attr.value.trim().toLowerCase()

            if (name.startsWith('on') || value.startsWith('javascript:')) {
                node.removeAttribute(attr.name)
            }
        })
    })

    return doc.body.innerHTML
}

const CATEGORY_TONES = [
    {
        item: 'border-blue-200 bg-blue-50/80',
        text: 'text-blue-900',
        badge: 'bg-white text-blue-700 ring-1 ring-blue-100',
    },
    {
        item: 'border-emerald-200 bg-emerald-50/80',
        text: 'text-emerald-900',
        badge: 'bg-white text-emerald-700 ring-1 ring-emerald-100',
    },
    {
        item: 'border-amber-200 bg-amber-50/80',
        text: 'text-amber-900',
        badge: 'bg-white text-amber-700 ring-1 ring-amber-100',
    },
    {
        item: 'border-rose-200 bg-rose-50/80',
        text: 'text-rose-900',
        badge: 'bg-white text-rose-700 ring-1 ring-rose-100',
    },
    {
        item: 'border-violet-200 bg-violet-50/80',
        text: 'text-violet-900',
        badge: 'bg-white text-violet-700 ring-1 ring-violet-100',
    },
]
