import { useEffect, useState } from 'react'
import { userGetBlogContent } from '../../../services/apiService'

export default function RelatedBlogPosts({ category, tone = 'orange' }) {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false

        async function loadPosts() {
            try {
                const result = await userGetBlogContent()
                const relatedPosts = (result || [])
                    .map((post) => ({
                        ...post,
                        category: post.category === 'Home' ? 'Blog' : post.category,
                    }))
                    .filter((post) => post.category === category)
                    .slice(0, 3)

                if (!cancelled) {
                    setPosts(relatedPosts)
                }
            } catch (error) {
                console.error(`Không thể tải bài viết ${category}:`, error)
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        loadPosts()
        return () => {
            cancelled = true
        }
    }, [category])

    if (loading) {
        return (
            <section className="mx-auto w-full max-w-310 px-4">
                <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-400">
                    Đang tải bài viết liên quan...
                </div>
            </section>
        )
    }

    if (posts.length === 0) {
        return null
    }

    const accentClass = tone === 'sky'
        ? 'text-sky-700 bg-sky-50 border-sky-100'
        : tone === 'cyan'
            ? 'text-cyan-700 bg-cyan-50 border-cyan-100'
            : 'text-[#f2682a] bg-[#fff1e7] border-[#f3c7a3]'

    return (
        <section className="float-in mx-auto w-full max-w-310 px-4">
            <div className="mb-6">
                <div>
                    <p className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${accentClass}`}>
                        {category}
                    </p>
                    <h3 className="mt-3 text-3xl font-black uppercase text-slate-950">Bài viết liên quan</h3>
                </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
                {posts.map((post) => (
                    <article
                        className="group flex min-h-64 flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#f2682a]/40 hover:shadow-[0_20px_40px_-18px_rgba(15,23,42,0.22)]"
                        key={post.id || post.title}
                    >
                        {post.imageUrl && (
                            <div className="h-32 overflow-hidden bg-slate-100">
                                <img
                                    alt=""
                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                    loading="lazy"
                                    src={post.imageUrl}
                                />
                            </div>
                        )}
                        <div className="flex flex-1 flex-col justify-between p-5">
                            <div>
                                <h4 className="line-clamp-2 text-lg font-black leading-tight text-slate-950 transition group-hover:text-[#f2682a]">
                                    {post.title}
                                </h4>
                                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">{post.excerpt}</p>
                            </div>
                            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                                    {post.readTime || 'Bài viết'}
                                </span>
                                <span className="text-xs font-black uppercase tracking-widest text-[#f2682a]">Đọc tại Blog</span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    )
}
