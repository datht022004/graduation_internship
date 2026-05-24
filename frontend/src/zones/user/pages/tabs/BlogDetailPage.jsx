import React from 'react'

export default function BlogDetailPage({ post, onBack }) {
    if (!post) return null

    const content = sanitizeBlogHtml(post.content || `<p>${escapeHtml(post.excerpt || '')}</p>`)
    const tags = (post.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean)

    return (
        <article className="float-in mx-auto w-full max-w-7xl px-3 py-6 sm:px-4 sm:py-8 md:py-12">
            <button
                type="button"
                onClick={onBack}
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:border-[#f2682a]/40 hover:text-[#f2682a]"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Quay lại
            </button>

            <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm sm:rounded-[32px]">
                {post.imageUrl && (
                    <img src={post.imageUrl} alt="" className="h-56 w-full object-cover sm:h-64 md:h-[500px] lg:h-[600px]" />
                )}
                <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 md:px-12 md:py-16">
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center rounded-full bg-[#fff1e7] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#f2682a]">
                            {post.category || 'Blog'}
                        </span>
                        {post.author && (
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                {post.author}
                            </span>
                        )}
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {post.readTime || '5 phút đọc'}
                        </span>
                    </div>
                    <h1 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl md:text-5xl">{post.title}</h1>
                    <p className="mt-5 text-base font-medium leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">{post.excerpt}</p>
                    {tags.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <span key={tag} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="blog-content mt-10 border-t border-slate-100 pt-10" dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            </div>
        </article>
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
