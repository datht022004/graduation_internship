import { useEffect, useState } from 'react'
import { getUserBlog } from '../../../../config/api'

export default function BlogTabPage() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedPost, setSelectedPost] = useState(null)
    const [activeCategory, setActiveCategory] = useState('')

    useEffect(() => {
        let cancelled = false
        async function load() {
            try {
                const result = await getUserBlog()
                if (!cancelled) {
                    setPosts(result || [])
                    setError('')
                }
            } catch (err) {
                console.error('Lỗi tải dữ liệu Blog:', err)
                if (!cancelled) setError('Không tải được bài viết.')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center py-32">
                <svg className="h-8 w-8 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
            </div>
        )
    }

    if (error) {
        return <div className="py-32 text-center text-slate-400">{error}</div>
    }

    if (posts.length === 0) {
        return <div className="py-32 text-center text-slate-400">Chưa có bài viết nào.</div>
    }

    const categories = [...new Set(posts.map((post) => post.category).filter(Boolean))]
    const selectedCategory = categories.includes(activeCategory) ? activeCategory : ''
    const visiblePosts = selectedCategory ? posts.filter((post) => post.category === selectedCategory) : posts
    const featuredPost = visiblePosts.find((post) => post.isFeatured) || visiblePosts[0]

    return (
        <div className="flex flex-col gap-6 md:gap-10 pb-16">
            {/* Featured Section */}
            <section className="float-in stagger-1 relative mx-4 mt-6">
                <div className="mx-auto max-w-310">
                    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                        <article className="group relative overflow-hidden rounded-[36px] bg-[linear-gradient(150deg,#1e252f,#0f141a)] p-8 md:p-12 text-white shadow-[0_30px_60px_-15px_rgba(242,104,42,0.15)] ring-1 ring-white/10 transition-transform duration-500 hover:shadow-[0_40px_80px_-20px_rgba(242,104,42,0.3)]">
                            {featuredPost.imageUrl && (
                                <img src={featuredPost.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity" />
                            )}
                            <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-[#f2682a]/20 blur-[100px] transition-opacity duration-500 group-hover:opacity-100" />
                            <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-[#f3c7a3]/10 blur-[120px]" />
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
                            
                            <div className="relative z-10 flex h-full flex-col justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full border border-[#f3c7a3]/30 bg-[#f3c7a3]/10 px-4 py-1.5 mb-6 backdrop-blur-md">
                                        <svg className="w-4 h-4 text-[#f3c7a3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f3c7a3]">Bài viết nổi bật</p>
                                    </div>
                                    <h2 className="max-w-3xl text-3xl font-black uppercase leading-tight tracking-wide md:text-5xl lg:text-6xl group-hover:text-[#f3c7a3] transition-colors duration-300 line-clamp-4">
                                        {featuredPost.title}
                                    </h2>
                                </div>
                                <div className="mt-12 flex items-center gap-4">
                                    <button onClick={() => setSelectedPost(featuredPost)} className="flex items-center gap-3 rounded-full bg-[#f2682a] px-6 py-4 text-sm font-black uppercase text-white transition-transform hover:scale-105 shadow-xl shadow-[#f2682a]/30" type="button">
                                        <span>Đọc bài nổi bật</span>
                                        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                                    </button>
                                </div>
                            </div>
                        </article>

                        <aside className="relative flex flex-col justify-center overflow-hidden rounded-[36px] bg-[linear-gradient(135deg,#fff8ef,#fdf1e1)] p-8 md:p-12 shadow-[0_20px_40px_-15px_rgba(242,104,42,0.1)] ring-1 ring-[#f2682a]/10">
                            <div className="absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/3 rounded-full bg-[#f2682a]/5 blur-[60px]" />
                            <div className="relative z-10 text-center">
                                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff1e7] text-[#f2682a] shadow-inner">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                                </div>
                                <p className="text-xs font-black uppercase tracking-[0.25em] text-[#a16207] mb-3">{visiblePosts.length} bài viết</p>
                                <h3 className="text-2xl md:text-3xl font-black uppercase text-slate-900 leading-tight">Insight theo<br/><span className="text-[#f2682a]">{selectedCategory || `${categories.length} chủ đề`}</span></h3>
                                <p className="mt-4 text-base font-medium leading-relaxed text-slate-600 line-clamp-4">
                                    {categories.slice(0, 4).join(', ') || 'SEO, website và quảng cáo'}.
                                </p>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            {/* Articles Grid */}
            <section className="float-in stagger-2 mx-auto w-full max-w-310 px-4">
                <div className="mb-6 border-b border-slate-200 pb-6 flex flex-col gap-5">
                    <div>
                        <h3 className="text-3xl font-black uppercase text-slate-900">{selectedCategory || 'Bài viết mới cập nhật'}</h3>
                        <p className="mt-2 text-slate-500 font-medium">Chọn danh mục để lọc bài viết tương ứng.</p>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        <CategoryTab
                            active={!selectedCategory}
                            count={posts.length}
                            label="Tất cả"
                            onClick={() => setActiveCategory('')}
                        />
                        {categories.map((category) => (
                            <CategoryTab
                                key={category}
                                active={selectedCategory === category}
                                count={posts.filter((post) => post.category === category).length}
                                label={category}
                                onClick={() => setActiveCategory(category)}
                            />
                        ))}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {visiblePosts.map((post, index) => (
                        <article className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e8d5bf] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(242,104,42,0.15)] hover:border-[#f2682a]/40" key={post.id || post.title}>
                            {post.imageUrl && (
                                <button type="button" onClick={() => setSelectedPost(post)} className="block h-40 overflow-hidden bg-slate-100 text-left">
                                    <img src={post.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                </button>
                            )}
                            <div className="flex flex-1 flex-col justify-between p-6">
                                <div>
                                <button type="button" onClick={() => setSelectedPost(post)} className="block w-full text-left">
                                    <h3 className="text-xl font-bold leading-tight text-slate-900 transition-colors line-clamp-3 group-hover:text-[#f2682a]">{post.title}</h3>
                                </button>
                                </div>
                            
                                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 group-hover:text-[#f2682a]/50 transition-colors">Vol {String(index + 1).padStart(2, '0')}</span>
                                    <button onClick={() => setSelectedPost(post)} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#f2682a] group-hover:text-[#d3561f] transition-colors" type="button">
                                        <span>Đọc chi tiết</span>
                                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
            {selectedPost && (
                <BlogPostDetail post={selectedPost} onClose={() => setSelectedPost(null)} />
            )}
        </div>
    )
}

function CategoryTab({ active, count, label, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-colors ${active ? 'border-[#f2682a] bg-[#f2682a] text-white shadow-lg shadow-[#f2682a]/20' : 'border-slate-200 bg-white text-slate-600 hover:border-[#f2682a]/40 hover:text-[#f2682a]'}`}
        >
            <span>{label}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>{count}</span>
        </button>
    )
}

function BlogPostDetail({ post, onClose }) {
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
                            <span className="inline-flex items-center rounded-full bg-[#fff1e7] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#f2682a]">{post.category}</span>
                            {post.author && <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{post.author}</span>}
                        </div>
                        <h2 className="text-3xl font-black leading-tight text-slate-950 md:text-5xl">{post.title}</h2>
                        <p className="mt-5 text-lg leading-8 text-slate-600">{post.excerpt}</p>
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
