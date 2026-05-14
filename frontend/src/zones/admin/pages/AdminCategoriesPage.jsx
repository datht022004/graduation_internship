import { useCallback, useEffect, useState } from 'react'
import AdminPageHeader from '../components/AdminPageHeader'
import AdminDataTable from '../components/AdminDataTable'
import AdminModal from '../components/AdminModal'
import AdminFormField from '../components/AdminFormField'
import AdminDeleteConfirm from '../components/AdminDeleteConfirm'
import { createCategory, deleteCategory, getCategories, updateCategory } from '../../../config/api'

const EMPTY_CATEGORY = {
    name: '',
    description: '',
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [formData, setFormData] = useState(EMPTY_CATEGORY)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState('')

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            setCategories(await getCategories())
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    function updateField(name, value) {
        setFormData((prev) => ({ ...prev, [name]: value }))
        setError('')
    }

    function handleAdd() {
        setEditingItem(null)
        setFormData(EMPTY_CATEGORY)
        setError('')
        setModalOpen(true)
    }

    function handleEdit(item) {
        setEditingItem(item)
        setFormData({
            name: item.name || '',
            description: item.description || '',
        })
        setError('')
        setModalOpen(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const payload = {
            name: formData.name.trim(),
            description: formData.description.trim(),
        }

        if (!payload.name) {
            setError('Vui lòng nhập tên danh mục.')
            return
        }

        if (editingItem) {
            await updateCategory(editingItem.id, payload)
        } else {
            await createCategory(payload)
        }
        setModalOpen(false)
        fetchData()
    }

    async function handleDelete() {
        setDeleting(true)
        try {
            await deleteCategory(deleteTarget.id)
            setDeleteTarget(null)
            fetchData()
        } catch (err) {
            const message = err.response?.data?.detail || err.message || 'Không thể xóa danh mục.'
            window.alert(message)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <>
            <AdminPageHeader
                title="Danh mục"
                subtitle="Nhóm bài viết blog theo chủ đề"
                actions={
                    <button onClick={handleAdd} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                        + Danh mục mới
                    </button>
                }
            />
            <div className="w-full px-6 py-6 lg:px-8">
                <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-800">Danh sách danh mục</h3>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-semibold text-slate-600">{categories.length}</span>
                    </div>
                    <AdminDataTable
                        columns={[
                            { key: 'name', label: 'Tên danh mục' },
                            { key: 'description', label: 'Mô tả', render: (value) => value || <span className="text-slate-400">Chưa có mô tả</span> },
                            { key: 'postCount', label: 'Số bài', render: (value) => <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-sm font-bold text-blue-700">{value}</span> },
                        ]}
                        data={categories}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={setDeleteTarget}
                        emptyMessage="Chưa có danh mục nào"
                    />
                </div>
            </div>

            <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <AdminFormField name="name" label="Tên danh mục" required placeholder="VD: SEO Foundation" value={formData.name} onChange={(val) => updateField('name', val)} />
                    <AdminFormField name="description" label="Mô tả" type="textarea" rows={4} placeholder="Ghi chú ngắn về nhóm bài viết này" value={formData.description} onChange={(val) => updateField('description', val)} />
                    {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{error}</p>}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setModalOpen(false)} className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">Hủy</button>
                        <button type="submit" className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">{editingItem ? 'Cập nhật' : 'Tạo danh mục'}</button>
                    </div>
                </form>
            </AdminModal>

            <AdminDeleteConfirm
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                itemName={deleteTarget?.name || ''}
                loading={deleting}
            />
        </>
    )
}
