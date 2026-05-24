import { useState, useEffect } from 'react'
import { adminSiteContentGetByPage, adminSiteContentUpdateById } from '../../../config/apiService'
import AdminDeleteConfirm from '../components/AdminDeleteConfirm'

const PAGES = [
    { key: 'home', label: 'Trang chủ' },
    { key: 'seo-service', label: 'Dịch vụ SEO' },
    { key: 'web-design', label: 'Thiết kế Website' },
    { key: 'ads', label: 'Quảng cáo' }
]

const CARD_LINK_TARGETS = [
    { key: '', label: 'Không điều hướng' },
    { key: 'seo-service', label: 'Dịch vụ SEO' },
    { key: 'web-design', label: 'Thiết kế Website' },
    { key: 'ads', label: 'Quảng cáo' },
    { key: 'blog', label: 'Blog' },
]

// Hàm kiểm tra type
function isObject(val) {
    return val !== null && typeof val === 'object' && !Array.isArray(val)
}

function DynamicFormEditor({ initialContent, onSave, onCancel, saving }) {
    const cloneContent = (value) => JSON.parse(JSON.stringify(value || {}))
    const [content, setContent] = useState(() => cloneContent(initialContent))
    const [savedContent, setSavedContent] = useState(() => cloneContent(initialContent))
    const [deleteRequest, setDeleteRequest] = useState(null)
    const [notice, setNotice] = useState('')

    const updateContent = (newContent) => {
        setContent(newContent)
        setNotice('')
        return newContent
    }

    const isEqual = (left, right) => JSON.stringify(left) === JSON.stringify(right)

    const isStringItemDirty = (rootKey, index) => {
        return !isEqual(content[rootKey]?.[index], savedContent[rootKey]?.[index])
    }

    const isObjectItemDirty = (rootKey, index) => {
        return !isEqual(content[rootKey]?.[index], savedContent[rootKey]?.[index])
    }

    const showSavedNotice = (message) => {
        setNotice(message)
        window.setTimeout(() => setNotice(''), 2600)
    }

    const saveContent = async (nextContent = content, message = 'Đã lưu thay đổi thành công.') => {
        const success = await onSave(nextContent, { closeAfterSave: false })
        if (success) {
            setSavedContent(cloneContent(nextContent))
            showSavedNotice(message)
        }
        return success
    }

    const formatLabel = (key) => key
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]/g, ' ')
        .trim()
        .toUpperCase()

    const emptyValueFrom = (value) => {
        if (Array.isArray(value)) return value.map(emptyValueFrom)
        if (isObject(value)) {
            return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, emptyValueFrom(val)]))
        }
        if (typeof value === 'number') return 0
        if (typeof value === 'boolean') return false
        return ''
    }

    const handleStringChange = (rootKey, index, val) => {
        const newContent = { ...content, [rootKey]: [...content[rootKey]] }
        newContent[rootKey][index] = val
        updateContent(newContent)
    }

    const handleObjectChange = (rootKey, index, field, val) => {
        const newContent = { ...content, [rootKey]: [...content[rootKey]] }
        newContent[rootKey][index] = { ...newContent[rootKey][index], [field]: val }
        updateContent(newContent)
    }

    const handleArrayStringChange = (rootKey, objIndex, field, strIndex, val) => {
        const newContent = { ...content, [rootKey]: [...content[rootKey]] }
        const targetObj = { ...newContent[rootKey][objIndex] }
        targetObj[field] = [...targetObj[field]]
        targetObj[field][strIndex] = val
        newContent[rootKey][objIndex] = targetObj
        updateContent(newContent)
    }

    const addStringItem = (rootKey) => {
        updateContent({ ...content, [rootKey]: [...(content[rootKey] || []), ''] })
    }

    const removeStringItem = (rootKey, index) => {
        return updateContent({ ...content, [rootKey]: content[rootKey].filter((_, itemIndex) => itemIndex !== index) })
    }

    const addObjectItem = (rootKey, arr) => {
        const template = arr[0] ? emptyValueFrom(arr[0]) : {}
        updateContent({ ...content, [rootKey]: [...arr, template] })
    }

    const removeObjectItem = (rootKey, index) => {
        return updateContent({ ...content, [rootKey]: content[rootKey].filter((_, itemIndex) => itemIndex !== index) })
    }

    const addArrayStringItem = (rootKey, objIndex, field) => {
        const newContent = { ...content, [rootKey]: [...content[rootKey]] }
        const targetObj = { ...newContent[rootKey][objIndex] }
        targetObj[field] = [...targetObj[field], '']
        newContent[rootKey][objIndex] = targetObj
        updateContent(newContent)
    }

    const removeArrayStringItem = (rootKey, objIndex, field, strIndex) => {
        const newContent = { ...content, [rootKey]: [...content[rootKey]] }
        const targetObj = { ...newContent[rootKey][objIndex] }
        targetObj[field] = targetObj[field].filter((_, itemIndex) => itemIndex !== strIndex)
        newContent[rootKey][objIndex] = targetObj
        return updateContent(newContent)
    }

    const requestDelete = (itemName, action) => {
        setDeleteRequest({ itemName, action })
    }

    const confirmDelete = async () => {
        const nextContent = deleteRequest?.action?.()
        setDeleteRequest(null)
        if (nextContent) {
            await saveContent(nextContent, 'Đã xóa và lưu thay đổi.')
        }
    }

    const renderArray = (rootKey, arr) => {
        if (arr.length === 0) {
            return (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                    <p className="text-sm text-slate-500">Chưa có mục nào.</p>
                    <button type="button" onClick={() => addStringItem(rootKey)} className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                        Thêm mục đầu tiên
                    </button>
                </div>
            )
        }

        if (typeof arr[0] === 'string') {
            return (
                <div className="space-y-2">
                    {arr.map((str, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <span className="mt-3 w-7 shrink-0 text-right text-xs font-bold text-slate-400">{i + 1}.</span>
                            <textarea
                                value={str}
                                onChange={e => handleStringChange(rootKey, i, e.target.value)}
                                className="min-h-20 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm leading-6 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-100"
                                rows={2}
                            />
                            <button
                                type="button"
                                onClick={() => requestDelete(`${formatLabel(rootKey)} - dòng ${i + 1}`, () => removeStringItem(rootKey, i))}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
                                aria-label={`Xóa dòng ${i + 1}`}
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => saveContent(content)}
                                disabled={saving || !isStringItemDirty(rootKey, i)}
                                className={`mt-0 flex h-10 shrink-0 items-center rounded-lg px-3 text-sm font-semibold text-white ${isStringItemDirty(rootKey, i) ? 'bg-blue-600 hover:bg-blue-700' : 'cursor-not-allowed bg-slate-300'} disabled:opacity-70`}
                            >
                                {saving ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={() => addStringItem(rootKey)} className="ml-9 mt-2 flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m6-6H6" /></svg>
                        Thêm dòng
                    </button>
                </div>
            )
        }

        if (isObject(arr[0])) {
            return (
                <div className="space-y-4">
                    {arr.map((obj, i) => (
                        <div key={i} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                                <div>
                                    <div className="text-sm font-bold text-slate-800">Mục {i + 1}</div>
                                    <div className="text-xs text-slate-500">Chỉnh nội dung hiển thị trên website</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => saveContent(content)}
                                        disabled={saving || !isObjectItemDirty(rootKey, i)}
                                        className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm ${isObjectItemDirty(rootKey, i) ? 'bg-blue-600 hover:bg-blue-700' : 'cursor-not-allowed bg-slate-300'} disabled:opacity-70`}
                                    >
                                        {saving ? 'Đang lưu...' : 'Lưu mục này'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => requestDelete(obj.title || `${formatLabel(rootKey)} - mục ${i + 1}`, () => removeObjectItem(rootKey, i))}
                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
                                        aria-label={`Xóa mục ${i + 1}`}
                                    >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {Object.keys(obj).map(field => {
                                    const val = obj[field]
                                    if (typeof val === 'string') {
                                        if (field.toLowerCase() === 'tabkey') {
                                            return (
                                                <div key={field}>
                                                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">{formatLabel(field)}</label>
                                                    <select
                                                        value={val}
                                                        onChange={e => handleObjectChange(rootKey, i, field, e.target.value)}
                                                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-100"
                                                    >
                                                        {CARD_LINK_TARGETS.map((target) => (
                                                            <option key={target.key || 'none'} value={target.key}>
                                                                {target.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <p className="mt-1 text-xs text-slate-500">Chọn nơi card sẽ mở khi khách bấm vào.</p>
                                                </div>
                                            )
                                        }

                                        const isLongText = val.length > 50 || ['desc', 'description', 'content', 'body'].includes(field.toLowerCase())
                                        return (
                                            <div key={field} className={isLongText ? 'md:col-span-2' : ''}>
                                                <label className="mb-1.5 block text-xs font-semibold text-slate-600">{formatLabel(field)}</label>
                                                {isLongText ? (
                                                    <textarea
                                                        value={val}
                                                        onChange={e => handleObjectChange(rootKey, i, field, e.target.value)}
                                                        className="min-h-28 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm leading-6 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-100"
                                                        rows={3}
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={val}
                                                        onChange={e => handleObjectChange(rootKey, i, field, e.target.value)}
                                                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-100"
                                                    />
                                                )}
                                            </div>
                                        )
                                    }
                                    if (Array.isArray(val) && (val.length === 0 || typeof val[0] === 'string')) {
                                        return (
                                            <div key={field} className="md:col-span-2">
                                                <label className="mb-2 block text-xs font-semibold text-slate-600">{formatLabel(field)}</label>
                                                <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
                                                    {val.map((str, strIdx) => (
                                                        <div key={strIdx} className="flex items-center gap-2">
                                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">{strIdx + 1}</span>
                                                            <input
                                                                type="text"
                                                                value={str}
                                                                onChange={e => handleArrayStringChange(rootKey, i, field, strIdx, e.target.value)}
                                                                className="h-10 flex-1 rounded-lg border border-slate-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-100"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => requestDelete(`${formatLabel(field)} - dòng ${strIdx + 1}`, () => removeArrayStringItem(rootKey, i, field, strIdx))}
                                                                className="flex h-9 w-9 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
                                                                aria-label={`Xóa dòng ${strIdx + 1}`}
                                                            >
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button type="button" onClick={() => addArrayStringItem(rootKey, i, field)} className="mt-1 flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50">
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m6-6H6" /></svg>
                                                        Thêm dòng
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    }
                                    return <div key={field} className="text-xs text-rose-500">Không hỗ trợ kiểu dữ liệu: {field}</div>
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        return <div className="text-sm text-slate-500">Định dạng không hỗ trợ</div>
    }

    return (
        <>
            <div className="flex h-full min-h-0 flex-1 flex-col">
                {notice && (
                    <div className="mb-4 flex shrink-0 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 13l4 4L19 7" /></svg>
                        {notice}
                    </div>
                )}
                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-1 pb-6 pr-2">
                    {Object.keys(content).map(rootKey => {
                        const val = content[rootKey]
                        if (Array.isArray(val)) {
                            const canAddObject = val.length > 0 && isObject(val[0])
                            const canAddString = val.length === 0 || typeof val[0] === 'string'
                            return (
                                <section key={rootKey} className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <h4 className="text-sm font-bold uppercase tracking-wide text-slate-800">{formatLabel(rootKey)}</h4>
                                            <p className="mt-1 text-xs text-slate-500">{val.length} mục hiện có</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => canAddObject ? addObjectItem(rootKey, val) : canAddString ? addStringItem(rootKey) : null}
                                            disabled={!canAddObject && !canAddString}
                                            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m6-6H6" /></svg>
                                            Thêm mục
                                        </button>
                                    </div>
                                    {renderArray(rootKey, val)}
                                </section>
                            )
                        }
                        return (
                            <div key={rootKey}>
                                <p className="text-sm text-rose-500">Only array items are currently supported in dynamic form: {rootKey}</p>
                            </div>
                        )
                    })}
                </div>

                <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-white pt-4">
                    <button
                        onClick={onCancel}
                        disabled={saving}
                        className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                    >
                        Đóng
                    </button>
                </div>
            </div>
            <AdminDeleteConfirm
                isOpen={!!deleteRequest}
                onClose={() => setDeleteRequest(null)}
                onConfirm={confirmDelete}
                itemName={deleteRequest?.itemName || ''}
            />
        </>
    )
}

export default function AdminSiteContentPage() {
    const [activeTab, setActiveTab] = useState('home')
    const [sections, setSections] = useState([])
    const [loading, setLoading] = useState(true)
    
    // Edit Modal state
    const [editItem, setEditItem] = useState(null)
    const [saving, setSaving] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    useEffect(() => {
        loadData(activeTab)
    }, [activeTab])

    async function loadData(pageKey) {
        setLoading(true)
        try {
            const data = await adminSiteContentGetByPage(pageKey)
            const sorted = (data || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            setSections(sorted)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleSave(newContent, options = {}) {
        const { closeAfterSave = true } = options
        try {
            setSaving(true)
            setErrorMsg('')
            
            await adminSiteContentUpdateById(editItem.id, {
                content: newContent
            })
            
            if (closeAfterSave) {
                setEditItem(null)
            } else {
                setEditItem((current) => current ? { ...current, content: newContent } : current)
            }
            loadData(activeTab)
        } catch (err) {
            setErrorMsg('Lỗi lưu dữ liệu: ' + err.message)
            return false
        } finally {
            setSaving(false)
        }
        return true
    }

    return (
        <div className="mx-auto max-w-5xl p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Giao diện CMS</h1>
                <p className="mt-1 text-sm text-slate-500">Quản lý nội dung động cho các trang Landing, Dịch vụ dễ dàng bằng Form.</p>
            </header>

            {/* Tabs */}
            <div className="mb-6 flex space-x-2 border-b border-slate-200 overflow-x-auto">
                {PAGES.map(page => (
                    <button
                        key={page.key}
                        onClick={() => setActiveTab(page.key)}
                        className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === page.key 
                                ? 'border-blue-600 text-blue-600' 
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                    >
                        {page.label}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="py-12 flex justify-center">
                    <svg className="h-8 w-8 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                </div>
            ) : sections.length === 0 ? (
                <div className="py-12 text-center text-slate-400">Không có dữ liệu (Chưa chạy mồi dữ liệu).</div>
            ) : (
                <div className="grid gap-4">
                    {sections.map(sec => (
                        <div key={sec.id} className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-blue-200">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold text-slate-900">{sec.title}</h3>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        {sec.section_key}
                                    </span>
                                </div>
                                <p className="mt-1.5 text-sm text-slate-500 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                    Đang chứa: {sec.content ? Object.keys(sec.content).map(k => `${k} (${sec.content[k]?.length || 0})`).join(', ') : 'Trống'}
                                </p>
                            </div>
                            <button
                                onClick={() => setEditItem(sec)}
                                className="rounded-xl bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            >
                                Chỉnh sửa
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !saving && setEditItem(null)}></div>
                    <div className="relative flex h-[92vh] max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[24px] bg-white p-5 shadow-2xl sm:p-8">
                        <div className="mb-6 flex shrink-0 justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">
                                    Sửa nội dung: <span className="text-blue-600">{editItem.title}</span>
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Chỉnh sửa trực tiếp trên giao diện Form thông minh.
                                </p>
                            </div>
                            <button onClick={() => !saving && setEditItem(null)} className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {errorMsg && (
                            <div className="mb-4 flex shrink-0 items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                {errorMsg}
                            </div>
                        )}

                        <div className="min-h-0 flex-1 overflow-hidden">
                            <DynamicFormEditor 
                                key={editItem.id}
                                initialContent={editItem.content} 
                                onSave={handleSave} 
                                onCancel={() => setEditItem(null)}
                                saving={saving}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
