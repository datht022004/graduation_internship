import { useCallback, useEffect, useState } from 'react'
import AdminPageHeader from '../components/AdminPageHeader'
import AdminDataTable from '../components/AdminDataTable'
import AdminModal from '../components/AdminModal'
import AdminFormField from '../components/AdminFormField'
import AdminDeleteConfirm from '../components/AdminDeleteConfirm'
import {
    getAdsMetrics, createAdsMetric, updateAdsMetric, deleteAdsMetric,
    getAdsChannels, createAdsChannel, updateAdsChannel, deleteAdsChannel,
} from '../../../config/api'

function CrudSection({ title, columns, fetchFn, createFn, updateFn, deleteFn, formFields, emptyMessage }) {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [formData, setFormData] = useState({})
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try { setData(await fetchFn()) } finally { setLoading(false) }
    }, [fetchFn])

    useEffect(() => { fetchData() }, [fetchData])

    function handleAdd() {
        setEditingItem(null)
        const initial = {}
        formFields.forEach((f) => { initial[f.name] = '' })
        setFormData(initial)
        setModalOpen(true)
    }

    function handleEdit(item) {
        setEditingItem(item)
        const initial = {}
        formFields.forEach((f) => { initial[f.name] = item[f.name] || '' })
        setFormData(initial)
        setModalOpen(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (editingItem) { await updateFn(editingItem.id, formData) } else { await createFn(formData) }
        setModalOpen(false)
        fetchData()
    }

    async function handleDelete() {
        setDeleting(true)
        await deleteFn(deleteTarget.id)
        setDeleting(false)
        setDeleteTarget(null)
        fetchData()
    }

    return (
        <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-800">{title}</h3>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{data.length}</span>
                </div>
                <button onClick={handleAdd} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700">+ Thêm mới</button>
            </div>
            <AdminDataTable columns={columns} data={data} loading={loading} onEdit={handleEdit} onDelete={setDeleteTarget} emptyMessage={emptyMessage} />
            <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Chỉnh sửa' : 'Thêm mới'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {formFields.map((field) => (
                        <AdminFormField key={field.name} {...field} value={formData[field.name]} onChange={(val) => setFormData((prev) => ({ ...prev, [field.name]: val }))} />
                    ))}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setModalOpen(false)} className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">Hủy</button>
                        <button type="submit" className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">{editingItem ? 'Cập nhật' : 'Tạo mới'}</button>
                    </div>
                </form>
            </AdminModal>
            <AdminDeleteConfirm isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} itemName={deleteTarget?.name || deleteTarget?.value || ''} loading={deleting} />
        </div>
    )
}

export default function AdminAdsPage() {
    return (
        <>
            <AdminPageHeader title="Quản lý Quảng cáo" subtitle="Nội dung hiển thị trên tab Quảng cáo của khách hàng" />
            <div className="w-full space-y-6 px-6 py-6 lg:px-8">
                <CrudSection
                    title="Chỉ số hiệu suất"
                    columns={[
                        { key: 'value', label: 'Giá trị', render: (v) => <span className="font-bold text-blue-600">{v}</span> },
                        { key: 'label', label: 'Mô tả' },
                    ]}
                    fetchFn={getAdsMetrics} createFn={createAdsMetric} updateFn={updateAdsMetric} deleteFn={deleteAdsMetric}
                    formFields={[
                        { name: 'value', label: 'Giá trị', type: 'text', required: true, placeholder: 'VD: -28%' },
                        { name: 'label', label: 'Mô tả', type: 'text', required: true, placeholder: 'VD: Giảm CPL sau tối ưu' },
                    ]}
                    emptyMessage="Chưa có chỉ số nào"
                />
                <CrudSection
                    title="Kênh quảng cáo"
                    columns={[
                        { key: 'name', label: 'Tên kênh' },
                        { key: 'kpi', label: 'KPI' },
                        { key: 'desc', label: 'Mô tả', render: (v) => <span className="line-clamp-2 text-slate-500">{v}</span> },
                    ]}
                    fetchFn={getAdsChannels} createFn={createAdsChannel} updateFn={updateAdsChannel} deleteFn={deleteAdsChannel}
                    formFields={[
                        { name: 'name', label: 'Tên kênh', type: 'text', required: true, placeholder: 'VD: Google Ads' },
                        { name: 'kpi', label: 'KPI chính', type: 'text', required: true, placeholder: 'VD: Lead quality' },
                        { name: 'desc', label: 'Mô tả', type: 'textarea', required: true, placeholder: 'Mô tả chi tiết kênh quảng cáo' },
                    ]}
                    emptyMessage="Chưa có kênh nào"
                />
            </div>
        </>
    )
}
