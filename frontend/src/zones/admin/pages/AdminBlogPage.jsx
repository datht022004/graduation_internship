import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AdminPageHeader from '../components/AdminPageHeader'
import AdminDataTable from '../components/AdminDataTable'
import AdminModal from '../components/AdminModal'
import AdminFormField from '../components/AdminFormField'
import AdminDeleteConfirm from '../components/AdminDeleteConfirm'
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, toggleFeaturedPost, getCategories } from '../../../config/api'

const EMPTY_BLOG_POST = {
    title: '',
    category: '',
    readTime: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    author: '',
    tags: '',
    isFeatured: false,
}

export default function AdminBlogPage() {
    const [posts, setPosts] = useState([])
    const [categoryRecords, setCategoryRecords] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [formData, setFormData] = useState(EMPTY_BLOG_POST)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [filterCategory, setFilterCategory] = useState('')
    const coverInputRef = useRef(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const [blogPosts, categories] = await Promise.all([getBlogPosts(), getCategories()])
            setPosts(blogPosts)
            setCategoryRecords(categories)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))]
    const categoryOptions = [
        ...new Set([
            ...categoryRecords.map((category) => category.name).filter(Boolean),
            ...categories,
        ]),
    ].map((category) => ({ label: category, value: category }))
    const filtered = filterCategory ? posts.filter((p) => p.category === filterCategory) : posts

    function updateField(name, value) {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    function handleAdd() {
        setEditingItem(null)
        setFormData(EMPTY_BLOG_POST)
        setModalOpen(true)
    }

    function handleEdit(item) {
        setEditingItem(item)
        setFormData({
            ...EMPTY_BLOG_POST,
            title: item.title || '',
            category: item.category || '',
            readTime: item.readTime || '',
            excerpt: item.excerpt || '',
            content: item.content || '',
            imageUrl: item.imageUrl || '',
            author: item.author || '',
            tags: item.tags || '',
            isFeatured: item.isFeatured,
        })
        setModalOpen(true)
    }

    function handleEstimateReadTime() {
        updateField('readTime', estimateReadTime(formData.content || formData.excerpt || ''))
    }

    function handleCoverImageFile(file) {
        if (!file) return

        const reader = new FileReader()
        reader.onload = () => updateField('imageUrl', reader.result)
        reader.readAsDataURL(file)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const payload = normalizePayload(formData)

        if (!payload.content?.trim()) {
            window.alert('Vui lòng nhập nội dung chi tiết bài viết.')
            return
        }

        if (editingItem) { await updateBlogPost(editingItem.id, payload) } else { await createBlogPost(payload) }
        setModalOpen(false)
        fetchData()
    }

    async function handleDelete() {
        setDeleting(true)
        await deleteBlogPost(deleteTarget.id)
        setDeleting(false)
        setDeleteTarget(null)
        fetchData()
    }

    async function handleToggleFeatured(item) {
        await toggleFeaturedPost(item.id)
        fetchData()
    }

    return (
        <>
            <AdminPageHeader
                title="Quản lý Blog"
                subtitle="Nội dung hiển thị trên tab Blog của khách hàng"
                actions={
                    <button onClick={handleAdd} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700">
                        + Bài viết mới
                    </button>
                }
            />
            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-800">Bài viết</h3>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{filtered.length}</span>
                        </div>
                        {categories.length > 0 && (
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                            >
                                <option value="">Tất cả danh mục</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <AdminDataTable
                        columns={[
                            { key: 'title', label: 'Tiêu đề' },
                            { key: 'category', label: 'Danh mục', render: (v) => <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{v}</span> },
                            { key: 'readTime', label: 'Thời gian đọc' },
                            {
                                key: 'isFeatured',
                                label: 'Nổi bật',
                                render: (v, item) => (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleToggleFeatured(item) }}
                                        className={`rounded-full px-2 py-0.5 text-xs font-semibold transition-colors ${v ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                    >
                                        {v ? 'Nổi bật' : 'Thường'}
                                    </button>
                                ),
                            },
                        ]}
                        data={filtered}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={setDeleteTarget}
                        emptyMessage="Chưa có bài viết nào"
                    />
                </div>
            </div>

            <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'} size="xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <EditorSection title="Thông tin bài viết">
                        <div className="grid gap-4 md:grid-cols-2">
                            <AdminFormField name="title" label="Tiêu đề" required placeholder="Tiêu đề bài viết" value={formData.title} onChange={(val) => updateField('title', val)} />
                            <AdminFormField
                                name="category"
                                label="Danh mục"
                                required
                                type="select"
                                placeholder="Chọn danh mục"
                                options={categoryOptions}
                                value={formData.category}
                                onChange={(val) => updateField('category', val)}
                            />
                            <AdminFormField name="author" label="Tác giả" placeholder="VD: DataZone Editorial" value={formData.author} onChange={(val) => updateField('author', val)} />
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <AdminFormField name="readTime" label="Thời gian đọc" required placeholder="VD: 7 phút đọc" value={formData.readTime} onChange={(val) => updateField('readTime', val)} />
                                </div>
                                <button type="button" onClick={handleEstimateReadTime} className="mt-6 h-11 rounded-xl border border-blue-200 bg-blue-50 px-3 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100">
                                    Tự tính
                                </button>
                            </div>
                        </div>
                        <AdminFormField name="excerpt" label="Tóm tắt" type="textarea" required placeholder="Mô tả ngắn về nội dung bài viết" rows={4} value={formData.excerpt} onChange={(val) => updateField('excerpt', val)} />
                        <AdminFormField name="tags" label="Tags" placeholder="VD: SEO, Checklist, Website" value={formData.tags} onChange={(val) => updateField('tags', val)} />
                        <AdminFormField name="isFeatured" label="Bài viết nổi bật" type="checkbox" value={formData.isFeatured} onChange={(val) => updateField('isFeatured', val)} />
                        {categoryOptions.length === 0 && (
                            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
                                Chưa có danh mục. Tạo danh mục trước rồi quay lại đăng bài.
                            </p>
                        )}
                    </EditorSection>

                    <EditorSection title="Ảnh đại diện">
                        <div className="grid gap-4 md:grid-cols-[1fr_240px]">
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <AdminFormField name="imageUrl" label="Ảnh đại diện" type="url" placeholder="Dán URL ảnh bìa bài viết" value={formData.imageUrl} onChange={(val) => updateField('imageUrl', val)} />
                                    </div>
                                    <button type="button" onClick={() => coverInputRef.current?.click()} className="mt-6 h-11 rounded-xl border border-slate-300 px-3 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50">
                                        Tải ảnh
                                    </button>
                                    <input
                                        ref={coverInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            handleCoverImageFile(e.target.files?.[0])
                                            e.target.value = ''
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                {formData.imageUrl ? (
                                    <img src={formData.imageUrl} alt="" className="h-full min-h-56 w-full object-cover" />
                                ) : (
                                    <div className="flex h-full min-h-56 items-center justify-center px-6 text-center text-sm font-medium text-slate-400">
                                        Chưa có ảnh đại diện
                                    </div>
                                )}
                            </div>
                        </div>
                    </EditorSection>

                    <BlogContentEditor
                        key={editingItem?.id || 'new-post'}
                        value={formData.content}
                        onChange={(val) => updateField('content', val)}
                    />

                    <div className="sticky bottom-0 -mx-6 -mb-5 flex gap-3 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
                        <button type="button" onClick={() => setModalOpen(false)} className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">Hủy</button>
                        <button type="submit" className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">{editingItem ? 'Cập nhật' : 'Đăng bài'}</button>
                    </div>
                </form>
            </AdminModal>

            <AdminDeleteConfirm isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} itemName={deleteTarget?.title || ''} loading={deleting} />
        </>
    )
}

function EditorSection({ title, children }) {
    return (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/40 p-4">
            <h4 className="text-sm font-black uppercase tracking-wide text-slate-700">{title}</h4>
            {children}
        </section>
    )
}

function BlogContentEditor({ value, onChange }) {
    const editorRef = useRef(null)
    const fileInputRef = useRef(null)
    const [mode, setMode] = useState('write')
    const plainText = useMemo(() => stripHtml(value), [value])
    const stats = useMemo(() => ({
        words: plainText ? plainText.split(/\s+/).filter(Boolean).length : 0,
        chars: plainText.length,
        readTime: estimateReadTime(value),
    }), [plainText, value])

    useEffect(() => {
        if (mode !== 'write') return
        if (editorRef.current && editorRef.current.innerHTML !== (value || '')) {
            editorRef.current.innerHTML = value || ''
        }
    }, [mode, value])

    function syncContent() {
        onChange(editorRef.current?.innerHTML || '')
    }

    function setContent(html) {
        onChange(html)
        if (editorRef.current && mode === 'write') {
            editorRef.current.innerHTML = html
        }
    }

    function runCommand(command, commandValue = null) {
        editorRef.current?.focus()
        document.execCommand(command, false, commandValue)
        syncContent()
    }

    function insertHtml(html) {
        runCommand('insertHTML', html)
    }

    function insertLink() {
        const url = window.prompt('Dán URL liên kết')
        if (url) runCommand('createLink', url)
    }

    function insertImageFromUrl() {
        const url = window.prompt('Dán URL ảnh')
        if (url) insertHtml(`<figure><img src="${escapeAttribute(url)}" alt=""><figcaption>Chú thích ảnh</figcaption></figure><p><br></p>`)
    }

    function insertImageFile(file) {
        if (!file) return

        const reader = new FileReader()
        reader.onload = () => insertHtml(`<figure><img src="${reader.result}" alt=""><figcaption>Chú thích ảnh</figcaption></figure><p><br></p>`)
        reader.readAsDataURL(file)
    }

    function applyTemplate(type) {
        const templates = {
            outline: '<h2>Mở bài</h2><p>Nêu vấn đề chính và lý do người đọc nên quan tâm.</p><h2>Nội dung chính</h2><h3>1. Bối cảnh</h3><p>Giải thích tình huống, dữ liệu hoặc pain point.</p><h3>2. Cách triển khai</h3><ul><li>Bước 1: ...</li><li>Bước 2: ...</li><li>Bước 3: ...</li></ul><h2>Kết luận</h2><p>Tóm tắt ý chính và lời khuyên hành động.</p>',
            checklist: '<h2>Checklist triển khai</h2><ul><li>Kiểm tra mục tiêu và KPI.</li><li>Chuẩn bị dữ liệu đầu vào.</li><li>Phân công người phụ trách.</li><li>Đặt lịch rà soát kết quả.</li></ul>',
            caseStudy: '<h2>Bối cảnh dự án</h2><p>Mô tả ngành, hiện trạng và mục tiêu ban đầu.</p><h2>Giải pháp</h2><p>Các thay đổi chính đã triển khai.</p><h2>Kết quả</h2><table><tbody><tr><th>Chỉ số</th><th>Trước</th><th>Sau</th></tr><tr><td>Traffic</td><td>...</td><td>...</td></tr><tr><td>Lead</td><td>...</td><td>...</td></tr></tbody></table>',
            cta: '<aside class="blog-callout"><strong>Cần tư vấn?</strong><p>Liên hệ đội ngũ để được audit nhanh và nhận lộ trình triển khai phù hợp.</p></aside>',
        }

        insertHtml(templates[type])
    }

    return (
        <EditorSection title="Nội dung chi tiết">
            <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="flex flex-wrap items-center gap-1">
                        <EditorButton title="Soạn thảo" active={mode === 'write'} onClick={() => setMode('write')}>Soạn</EditorButton>
                        <EditorButton title="Xem trước" active={mode === 'preview'} onClick={() => setMode('preview')}>Preview</EditorButton>
                        <EditorButton title="Chỉnh HTML" active={mode === 'source'} onClick={() => setMode('source')}>HTML</EditorButton>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                        <span>{stats.words} từ</span>
                        <span>{stats.chars} ký tự</span>
                        <span>{stats.readTime}</span>
                    </div>
                </div>

                {mode === 'write' && (
                    <>
                        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-white px-2 py-2">
                            <EditorButton title="Hoàn tác" onClick={() => runCommand('undo')}>↶</EditorButton>
                            <EditorButton title="Làm lại" onClick={() => runCommand('redo')}>↷</EditorButton>
                            <EditorDivider />
                            <EditorButton title="Đoạn văn" onClick={() => runCommand('formatBlock', 'p')}>P</EditorButton>
                            <EditorButton title="Heading 2" onClick={() => runCommand('formatBlock', 'h2')}>H2</EditorButton>
                            <EditorButton title="Heading 3" onClick={() => runCommand('formatBlock', 'h3')}>H3</EditorButton>
                            <EditorDivider />
                            <EditorButton title="In đậm" className="font-black" onClick={() => runCommand('bold')}>B</EditorButton>
                            <EditorButton title="In nghiêng" className="italic" onClick={() => runCommand('italic')}>I</EditorButton>
                            <EditorButton title="Gạch chân" className="underline" onClick={() => runCommand('underline')}>U</EditorButton>
                            <EditorButton title="Gạch ngang" className="line-through" onClick={() => runCommand('strikeThrough')}>S</EditorButton>
                            <label className="flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700">
                                Màu
                                <input type="color" className="h-5 w-6 cursor-pointer border-0 bg-transparent p-0" onChange={(e) => runCommand('foreColor', e.target.value)} />
                            </label>
                            <label className="flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700">
                                Nền
                                <input type="color" className="h-5 w-6 cursor-pointer border-0 bg-transparent p-0" onChange={(e) => runCommand('hiliteColor', e.target.value)} />
                            </label>
                            <EditorDivider />
                            <EditorButton title="Canh trái" onClick={() => runCommand('justifyLeft')}>←</EditorButton>
                            <EditorButton title="Canh giữa" onClick={() => runCommand('justifyCenter')}>↔</EditorButton>
                            <EditorButton title="Canh phải" onClick={() => runCommand('justifyRight')}>→</EditorButton>
                            <EditorButton title="Canh đều" onClick={() => runCommand('justifyFull')}>☰</EditorButton>
                            <EditorDivider />
                            <EditorButton title="Danh sách chấm" className="text-lg" onClick={() => runCommand('insertUnorderedList')}>•</EditorButton>
                            <EditorButton title="Danh sách số" onClick={() => runCommand('insertOrderedList')}>1.</EditorButton>
                            <EditorButton title="Trích dẫn" onClick={() => runCommand('formatBlock', 'blockquote')}>Quote</EditorButton>
                            <EditorButton title="Mã inline" onClick={() => insertHtml('<code>code</code>')}>Code</EditorButton>
                            <EditorButton title="Khối code" onClick={() => insertHtml('<pre><code>Nhập đoạn code tại đây</code></pre><p><br></p>')}>Pre</EditorButton>
                            <EditorDivider />
                            <EditorButton title="Chèn liên kết" onClick={insertLink}>Link</EditorButton>
                            <EditorButton title="Gỡ liên kết" onClick={() => runCommand('unlink')}>Unlink</EditorButton>
                            <EditorButton title="Chèn ảnh bằng URL" onClick={insertImageFromUrl}>Ảnh URL</EditorButton>
                            <EditorButton title="Tải ảnh từ máy" onClick={() => fileInputRef.current?.click()}>Tải ảnh</EditorButton>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    insertImageFile(e.target.files?.[0])
                                    e.target.value = ''
                                }}
                            />
                            <EditorButton title="Đường kẻ" onClick={() => insertHtml('<hr><p><br></p>')}>HR</EditorButton>
                            <EditorButton title="Bảng 3 cột" onClick={() => insertHtml('<table><tbody><tr><th>Cột 1</th><th>Cột 2</th><th>Cột 3</th></tr><tr><td>Nội dung</td><td>Nội dung</td><td>Nội dung</td></tr></tbody></table><p><br></p>')}>Bảng</EditorButton>
                            <EditorButton title="Khung lưu ý" onClick={() => insertHtml('<aside class="blog-callout"><strong>Lưu ý:</strong><p>Nhập nội dung nổi bật tại đây.</p></aside><p><br></p>')}>Lưu ý</EditorButton>
                            <EditorButton title="Xóa định dạng" onClick={() => runCommand('removeFormat')}>Clear</EditorButton>
                        </div>

                        <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
                            <EditorButton title="Chèn dàn ý SEO" onClick={() => applyTemplate('outline')}>Dàn ý SEO</EditorButton>
                            <EditorButton title="Chèn checklist" onClick={() => applyTemplate('checklist')}>Checklist</EditorButton>
                            <EditorButton title="Chèn case study" onClick={() => applyTemplate('caseStudy')}>Case study</EditorButton>
                            <EditorButton title="Chèn CTA" onClick={() => applyTemplate('cta')}>CTA</EditorButton>
                        </div>

                        <div
                            ref={editorRef}
                            className="blog-editor min-h-96 px-5 py-4 text-sm leading-7 text-slate-700 focus:outline-none"
                            contentEditable
                            role="textbox"
                            aria-label="Nội dung chi tiết bài viết"
                            data-placeholder="Viết nội dung bài viết tại đây."
                            onInput={syncContent}
                            onBlur={syncContent}
                            suppressContentEditableWarning
                        />
                    </>
                )}

                {mode === 'preview' && (
                    <div className="blog-content min-h-96 px-5 py-4" dangerouslySetInnerHTML={{ __html: value || '<p class="text-slate-400">Chưa có nội dung để xem trước.</p>' }} />
                )}

                {mode === 'source' && (
                    <textarea
                        value={value || ''}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-96 w-full resize-y border-0 bg-slate-950 px-5 py-4 font-mono text-sm leading-7 text-slate-100 outline-none"
                        placeholder="<h2>Tiêu đề</h2><p>Nội dung...</p>"
                    />
                )}
            </div>
        </EditorSection>
    )
}

function EditorButton({ title, className = '', active = false, onClick, children }) {
    return (
        <button
            type="button"
            title={title}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={`min-h-9 rounded-lg border px-3 text-xs font-semibold transition-colors ${active ? 'border-blue-200 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'} ${className}`}
        >
            {children}
        </button>
    )
}

function EditorDivider() {
    return <span className="mx-1 h-7 w-px bg-slate-200" />
}

function normalizePayload(data) {
    return {
        ...data,
        readTime: data.readTime?.trim() || estimateReadTime(data.content),
    }
}

function estimateReadTime(html) {
    const words = stripHtml(html).split(/\s+/).filter(Boolean).length
    const minutes = Math.max(1, Math.ceil(words / 220))
    return `${minutes} phút đọc`
}

function stripHtml(html = '') {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent?.trim() || ''
}

function escapeAttribute(value = '') {
    return value.replace(/"/g, '&quot;')
}
