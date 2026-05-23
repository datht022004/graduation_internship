import { useEffect, useState } from 'react'
import AdminPageHeader from '../components/AdminPageHeader'
import AdminDataTable from '../components/AdminDataTable'
import AdminModal from '../components/AdminModal'
import AdminFormField from '../components/AdminFormField'
import AdminDeleteConfirm from '../components/AdminDeleteConfirm'
import { adminCompanyProfileCreate, adminCompanyProfileDeleteById, adminCompanyProfileGetList, adminCompanyProfileUpdateById } from '../../../config/apiService'

const EMPTY_PROFILE = {
    section_key: '',
    title: '',
    content: ''
}

export default function AdminCompanyProfilePage() {
    const [profiles, setProfiles] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [formData, setFormData] = useState(EMPTY_PROFILE)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState('')

    const fetchData = async () => {
        setLoading(true)
        try {
            const data = await adminCompanyProfileGetList()
            setProfiles(data || [])
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
        setFormData(EMPTY_PROFILE)
        setError('')
        setModalOpen(true)
    }

    function handleEdit(item) {
        setEditingItem(item)
        setFormData({
            section_key: item.section_key || '',
            title: item.title || '',
            content: typeof item.content === 'object' ? JSON.stringify(item.content) : (item.content || ''),
        })
        setError('')
        setModalOpen(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        
        let parsedContent = formData.content
        try {
            parsedContent = JSON.parse(formData.content)
        } catch {
            // keep as string if not valid JSON
        }

        const payload = {
            section_key: formData.section_key.trim(),
            title: formData.title.trim(),
            content: parsedContent
        }

        if (!payload.section_key || !payload.title) {
            setError('Vui lòng nhập section key và tiêu đề.')
            return
        }

        try {
            if (editingItem) {
                await adminCompanyProfileUpdateById(editingItem.id, payload)
            } else {
                await adminCompanyProfileCreate(payload)
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
            await adminCompanyProfileDeleteById(deleteTarget.id)
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
                title="Hồ sơ Công ty"
                subtitle="Quản lý các thông tin giới thiệu công ty"
                actions={
                    <button onClick={handleAdd} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                        + Thêm hồ sơ
                    </button>
                }
            />
            <div className="w-full px-6 py-6 lg:px-8">
                <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-800">Danh sách hồ sơ</h3>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-semibold text-slate-600">{profiles.length}</span>
                    </div>
                    <AdminDataTable
                        columns={[
                            { key: 'section_key', label: 'Mã phần (Section)' },
                            { key: 'title', label: 'Tiêu đề' },
                        ]}
                        data={profiles}
                        loading={loading}
                        showViewAction={false}
                        onEdit={handleEdit}
                        onDelete={setDeleteTarget}
                        emptyMessage="Chưa có hồ sơ nào"
                    />
                </div>
            </div>

            <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Chỉnh sửa hồ sơ' : 'Thêm hồ sơ mới'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <AdminFormField name="section_key" label="Mã phần (VD: intro, vision)" required value={formData.section_key} onChange={(val) => updateField('section_key', val)} />
                    <AdminFormField name="title" label="Tiêu đề" required value={formData.title} onChange={(val) => updateField('title', val)} />
                    <AdminFormField name="content" label="Nội dung (chuỗi hoặc JSON)" type="textarea" rows={6} value={formData.content} onChange={(val) => updateField('content', val)} />
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
