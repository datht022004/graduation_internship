export default function BlogPostPreviewModal({ post, onClose }) {
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
