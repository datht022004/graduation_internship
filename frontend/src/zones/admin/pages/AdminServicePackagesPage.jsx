import { useEffect, useState } from 'react'
import AdminPageHeader from '../components/AdminPageHeader'
import AdminDataTable from '../components/AdminDataTable'
import AdminModal from '../components/AdminModal'
import AdminFormField from '../components/AdminFormField'
import AdminDeleteConfirm from '../components/AdminDeleteConfirm'
import { adminServicePackagesCreate, adminServicePackagesDeleteById, adminServicePackagesGetList, adminServicePackagesUpdateById } from '../../../config/apiService'

const EMPTY_PACKAGE = {
    service_type: '',
    title: '',
    summary: '',
    price_label: '',
    points: '',
    is_active: true
}

export default function AdminServicePackagesPage() {
    const [packages, setPackages] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [formData, setFormData] = useState(EMPTY_PACKAGE)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState('')

    const fetchData = async () => {
        setLoading(true)
        try {
            const data = await adminServicePackagesGetList()
            setPackages(data || [])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    function updateField(name, value) {
        setFormData((prev) => ({ ...prev, [name]: value }))
        setError('')
    }

    function handleAdd() {
        setEditingItem(null)
        setFormData(EMPTY_PACKAGE)
        setError('')
        setModalOpen(true)
    }

    function handleEdit(item) {
        setEditingItem(item)
        setFormData({
            service_type: item.service_type || '',
            title: item.title || '',
            summary: item.summary || '',
            price_label: item.price_label || '',
            points: item.points ? item.points.join('\n') : '',
            is_active: item.is_active !== false
        })
        setError('')
        setModalOpen(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        
        const payload = {
            service_type: formData.service_type.trim(),
            title: formData.title.trim(),
            summary: formData.summary.trim(),
            price_label: formData.price_label.trim(),
            points: formData.points.split('\n').map(f => f.trim()).filter(f => f),
            is_active: formData.is_active
        }

        if (!payload.service_type || !payload.title) {
            setError('Vui lòng nhập loại dịch vụ và tiêu đề.')
            return
        }

        try {
            if (editingItem) {
                await adminServicePackagesUpdateById(editingItem.id, payload)
            } else {
                await adminServicePackagesCreate(payload)
            }
            setModalOpen(false)
            fetchData()
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Lỗi lưu dữ liệu')
        }
    }

    async function handleDelete() {
        setDeleting(true)
        try {
            await adminServicePackagesDeleteById(deleteTarget.id)
            setDeleteTarget(null)
            fetchData()
        } catch (err) {
            const message = err.response?.data?.detail || err.message || 'Không thể xóa.'
            window.alert(message)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <>
            <AdminPageHeader
                title="Gói Dịch Vụ"
                subtitle="Quản lý các gói dịch vụ cung cấp"
                actions={
                    <button onClick={handleAdd} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                        + Thêm gói
                    </button>
                }
            />
            <div className="w-full px-6 py-6 lg:px-8">
                <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-800">Danh sách gói dịch vụ</h3>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-semibold text-slate-600">{packages.length}</span>
                    </div>
                    <AdminDataTable
                        columns={[
                            { key: 'service_type', label: 'Loại DV' },
                            { key: 'title', label: 'Tên gói' },
                            { key: 'price_label', label: 'Giá' },
                            { key: 'is_active', label: 'Trạng thái', render: (val) => val ? 'Hoạt động' : 'Ẩn' },
                        ]}
                        data={packages}
                        loading={loading}
                        showViewAction={false}
                        onEdit={handleEdit}
                        onDelete={setDeleteTarget}
                        emptyMessage="Chưa có gói dịch vụ nào"
                    />
                </div>
            </div>

            <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Chỉnh sửa gói' : 'Thêm gói mới'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <AdminFormField name="service_type" label="Loại dịch vụ (VD: seo, web)" required value={formData.service_type} onChange={(val) => updateField('service_type', val)} />
                    <AdminFormField name="title" label="Tên gói" required value={formData.title} onChange={(val) => updateField('title', val)} />
                    <AdminFormField name="price_label" label="Giá" value={formData.price_label} onChange={(val) => updateField('price_label', val)} />
                    <AdminFormField name="summary" label="Mô tả" type="textarea" rows={2} value={formData.summary} onChange={(val) => updateField('summary', val)} />
                    <AdminFormField name="points" label="Các tính năng (mỗi dòng 1 tính năng)" type="textarea" rows={4} value={formData.points} onChange={(val) => updateField('points', val)} />
                    
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <input type="checkbox" checked={formData.is_active} onChange={(e) => updateField('is_active', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                        Hoạt động
                    </label>

                    {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{error}</p>}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setModalOpen(false)} className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">Hủy</button>
                        <button type="submit" className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">{editingItem ? 'Cập nhật' : 'Tạo mới'}</button>
                    </div>
                </form>
            </AdminModal>

            <AdminDeleteConfirm
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                itemName={deleteTarget?.title || ''}
                loading={deleting}
            />
        </>
    )
}
