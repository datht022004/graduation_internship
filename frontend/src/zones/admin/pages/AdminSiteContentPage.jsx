import { useState, useEffect } from 'react'
import { adminSiteContentGetByPage, adminSiteContentUpdateById } from '../../../config/apiService'

const PAGES = [
    { key: 'home', label: 'Trang chủ' },
    { key: 'seo-service', label: 'Dịch vụ SEO' },
    { key: 'web-design', label: 'Thiết kế Website' },
    { key: 'ads', label: 'Quảng cáo' }
]

// Hàm kiểm tra type
function isObject(val) {
    return val !== null && typeof val === 'object' && !Array.isArray(val)
}

function DynamicFormEditor({ initialContent, onSave, onCancel, saving }) {
    // state content clone
    const [content, setContent] = useState(() => JSON.parse(JSON.stringify(initialContent)))

    const handleStringChange = (rootKey, index, val) => {
        const newContent = { ...content }
        newContent[rootKey][index] = val
        setContent(newContent)
    }

    const handleObjectChange = (rootKey, index, field, val) => {
        const newContent = { ...content }
        newContent[rootKey][index][field] = val
        setContent(newContent)
    }

    const handleArrayStringChange = (rootKey, objIndex, field, strIndex, val) => {
        const newContent = { ...content }
        newContent[rootKey][objIndex][field][strIndex] = val
        setContent(newContent)
    }

    const addStringItem = (rootKey) => {
        const newContent = { ...content }
        if (!newContent[rootKey]) newContent[rootKey] = []
        newContent[rootKey].push("")
        setContent(newContent)
    }

    const removeStringItem = (rootKey, index) => {
        const newContent = { ...content }
        newContent[rootKey].splice(index, 1)
        setContent(newContent)
    }

    const renderArray = (rootKey, arr) => {
        if (arr.length === 0) return <p className="text-sm text-slate-500">Mảng rỗng</p>
        
        // Nếu là mảng các chuỗi
        if (typeof arr[0] === 'string') {
            return (
                <div className="space-y-2">
                    {arr.map((str, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <span className="mt-2.5 text-xs font-bold text-slate-400 w-6 text-right">{i + 1}.</span>
                            <textarea
                                value={str}
                                onChange={e => handleStringChange(rootKey, i, e.target.value)}
                                className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                                rows={2}
                            />
                            <button type="button" onClick={() => removeStringItem(rootKey, i)} className="p-2 text-rose-500 hover:bg-rose-50 rounded">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={() => addStringItem(rootKey)} className="ml-8 mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Thêm dòng
                    </button>
                </div>
            )
        }

        // Nếu là mảng các object
        if (isObject(arr[0])) {
            return (
                <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 w-full scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                    {arr.map((obj, i) => (
                        <div key={i} className="w-[85%] sm:w-[320px] shrink-0 snap-center rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm relative">
                            <div className="mb-3 border-b border-slate-200 pb-2 text-sm font-bold text-slate-700">Mục {i + 1}</div>
                            <div className="grid gap-3">
                                {Object.keys(obj).map(field => {
                                    const val = obj[field]
                                    if (typeof val === 'string') {
                                        return (
                                            <div key={field}>
                                                <label className="mb-1 block text-xs font-semibold text-slate-600 uppercase tracking-wider">{field}</label>
                                                {val.length > 50 ? (
                                                    <textarea
                                                        value={val}
                                                        onChange={e => handleObjectChange(rootKey, i, field, e.target.value)}
                                                        className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                                                        rows={2}
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={val}
                                                        onChange={e => handleObjectChange(rootKey, i, field, e.target.value)}
                                                        className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                                                    />
                                                )}
                                            </div>
                                        )
                                    }
                                    if (Array.isArray(val) && typeof val[0] === 'string') {
                                        return (
                                            <div key={field}>
                                                <label className="mb-1 block text-xs font-semibold text-slate-600 uppercase tracking-wider">{field} (Danh sách)</label>
                                                <div className="space-y-2 pl-4 border-l-2 border-slate-200">
                                                    {val.map((str, strIdx) => (
                                                        <div key={strIdx} className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                                            <input
                                                                type="text"
                                                                value={str}
                                                                onChange={e => handleArrayStringChange(rootKey, i, field, strIdx, e.target.value)}
                                                                className="flex-1 rounded-lg border border-slate-300 p-1.5 text-sm focus:border-blue-500 focus:outline-none"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    }
                                    return <div key={field} className="text-xs text-rose-500">Unrenderable field type: {field}</div>
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
        <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1 pb-4">
            {Object.keys(content).map(rootKey => {
                const val = content[rootKey]
                if (Array.isArray(val)) {
                    return (
                        <div key={rootKey} className="border-t border-slate-100 pt-4 first:border-0 first:pt-0">
                            <h4 className="mb-3 text-sm font-bold text-slate-800 bg-slate-100 inline-block px-3 py-1 rounded-full uppercase tracking-widest">{rootKey}</h4>
                            {renderArray(rootKey, val)}
                        </div>
                    )
                }
                return (
                    <div key={rootKey}>
                        <p className="text-sm text-rose-500">Only array items are currently supported in dynamic form: {rootKey}</p>
                    </div>
                )
            })}

            <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                    onClick={onCancel}
                    disabled={saving}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                    Hủy
                </button>
                <button
                    onClick={() => onSave(content)}
                    disabled={saving}
                    className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 shadow-md transition-all hover:shadow-lg"
                >
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </div>
        </div>
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

    async function handleSave(newContent) {
        try {
            setSaving(true)
            setErrorMsg('')
            
            await adminSiteContentUpdateById(editItem.id, {
                content: newContent
            })
            
            setEditItem(null)
            loadData(activeTab) // reload list
        } catch (err) {
            setErrorMsg('Lỗi lưu dữ liệu: ' + err.message)
        } finally {
            setSaving(false)
        }
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
                    <div className="relative w-full max-w-3xl rounded-[24px] bg-white p-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="mb-6 flex justify-between items-center">
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
                            <div className="mb-4 rounded-lg bg-rose-50 p-3 text-sm font-medium text-rose-600 border border-rose-200 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                {errorMsg}
                            </div>
                        )}

                        <div className="flex-1 overflow-hidden">
                            <DynamicFormEditor 
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
