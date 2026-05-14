import { useCallback, useEffect, useState } from 'react'
import AdminDataTable from '../components/AdminDataTable'
import AdminDeleteConfirm from '../components/AdminDeleteConfirm'
import AdminFormField from '../components/AdminFormField'
import AdminModal from '../components/AdminModal'
import AdminPageHeader from '../components/AdminPageHeader'
import { createManagedUser, deleteManagedUser, getUserPage, updateManagedUser } from '../../../config/api'

const EMPTY_USER = {
    name: '',
    email: '',
    role: 'user',
    password: '',
}

const PAGE_SIZE = 8

const ROLE_OPTIONS = [
    { label: 'User', value: 'user' },
    { label: 'Admin', value: 'admin' },
]

export default function AdminUsersPage() {
    const [users, setUsers] = useState([])
    const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 1 })
    const [searchInput, setSearchInput] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [formData, setFormData] = useState(EMPTY_USER)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState('')

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getUserPage({
                q: searchTerm,
                role: roleFilter,
                page,
                pageSize: PAGE_SIZE,
            })
            setUsers(data.items || [])
            setPagination(data)
        } finally {
            setLoading(false)
        }
    }, [page, roleFilter, searchTerm])

    useEffect(() => { fetchData() }, [fetchData])

    function updateField(name, value) {
        setFormData((prev) => ({ ...prev, [name]: value }))
        setError('')
    }

    function handleSearch(e) {
        e.preventDefault()
        setSearchTerm(searchInput.trim())
        setPage(1)
    }

    function handleClearFilters() {
        setSearchInput('')
        setSearchTerm('')
        setRoleFilter('')
        setPage(1)
    }

    function handleRoleFilter(value) {
        setRoleFilter(value)
        setPage(1)
    }

    function handleAdd() {
        setEditingItem(null)
        setFormData(EMPTY_USER)
        setError('')
        setModalOpen(true)
    }

    function handleEdit(item) {
        setEditingItem(item)
        setFormData({
            name: item.name || '',
            email: item.email || '',
            role: item.role || 'user',
            password: '',
        })
        setError('')
        setModalOpen(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const payload = {
            name: formData.name.trim(),
            role: formData.role,
        }

        if (!payload.name) {
            setError('Vui lòng nhập tên người dùng.')
            return
        }

        if (!['admin', 'user'].includes(payload.role)) {
            setError('Vui lòng chọn vai trò hợp lệ.')
            return
        }

        if (editingItem) {
            if (formData.password.trim()) {
                if (formData.password.trim().length < 6) {
                    setError('Mật khẩu mới phải có ít nhất 6 ký tự.')
                    return
                }
                payload.password = formData.password.trim()
            }
            await saveUser(() => updateManagedUser(editingItem.email, payload))
        } else {
            payload.email = formData.email.trim().toLowerCase()
            payload.password = formData.password.trim()
            if (!isValidEmail(payload.email)) {
                setError('Vui lòng nhập email hợp lệ.')
                return
            }
            if (payload.password.length < 6) {
                setError('Mật khẩu phải có ít nhất 6 ký tự.')
                return
            }
            await saveUser(() => createManagedUser(payload))
        }
    }

    async function saveUser(action) {
        try {
            await action()
            setModalOpen(false)
            fetchData()
        } catch (err) {
            const message = err.response?.data?.detail || err.message || 'Không thể lưu người dùng.'
            setError(message)
        }
    }

    async function handleDelete() {
        setDeleting(true)
        try {
            await deleteManagedUser(deleteTarget.email)
            setDeleteTarget(null)
            fetchData()
        } catch (err) {
            const message = err.response?.data?.detail || err.message || 'Không thể xóa người dùng.'
            window.alert(message)
        } finally {
            setDeleting(false)
        }
    }

    const hasFilter = !!searchTerm || !!roleFilter

    return (
        <>
            <AdminPageHeader
                title="Người dùng"
                subtitle="Quản lý tài khoản đăng nhập và quyền truy cập hệ thống"
                actions={
                    <button onClick={handleAdd} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                        + Người dùng mới
                    </button>
                }
            />
            <div className="w-full px-6 py-6 lg:px-8">
                <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-slate-800">Danh sách người dùng</h3>
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-semibold text-slate-600">{pagination.total}</span>
                        </div>
                        <form className="flex flex-wrap items-center justify-end gap-2" onSubmit={handleSearch}>
                            <input
                                className="h-10 w-72 rounded-lg border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Tìm theo tên hoặc email"
                                type="search"
                                value={searchInput}
                            />
                            <select
                                className="h-10 rounded-lg border border-slate-300 px-4 text-sm text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                onChange={(e) => handleRoleFilter(e.target.value)}
                                value={roleFilter}
                            >
                                <option value="">Tất cả vai trò</option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                            </select>
                            <button className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700" type="submit">
                                Search
                            </button>
                            {hasFilter && (
                                <button className="h-10 rounded-lg px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100" onClick={handleClearFilters} type="button">
                                    Xóa lọc
                                </button>
                            )}
                        </form>
                    </div>

                    <AdminDataTable
                        columns={[
                            { key: 'name', label: 'Tên' },
                            { key: 'email', label: 'Email' },
                            {
                                key: 'role',
                                label: 'Vai trò',
                                render: (value) => (
                                    <span className={`rounded-full px-2.5 py-0.5 text-sm font-bold ${value === 'admin' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {value === 'admin' ? 'Admin' : 'User'}
                                    </span>
                                ),
                            },
                            {
                                key: 'authProviders',
                                label: 'Đăng nhập',
                                render: (value) => (
                                    <span className="text-sm font-medium text-slate-500">
                                        {(value || []).join(', ') || 'password'}
                                    </span>
                                ),
                            },
                        ]}
                        data={users}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={setDeleteTarget}
                        emptyMessage="Chưa có người dùng nào"
                    />

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                        <p className="text-sm font-medium text-slate-500">
                            Trang {pagination.page} / {pagination.totalPages} · Tổng {pagination.total} người dùng
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-300 disabled:hover:bg-white disabled:hover:text-slate-600"
                                disabled={pagination.page <= 1 || loading}
                                onClick={() => setPage((value) => Math.max(value - 1, 1))}
                                type="button"
                            >
                                Trước
                            </button>
                            <button
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-300 disabled:hover:bg-white disabled:hover:text-slate-600"
                                disabled={pagination.page >= pagination.totalPages || loading}
                                onClick={() => setPage((value) => value + 1)}
                                type="button"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Chỉnh sửa người dùng' : 'Tạo người dùng mới'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <AdminFormField name="name" label="Tên người dùng" required placeholder="VD: Nguyễn Văn A" value={formData.name} onChange={(val) => updateField('name', val)} />
                    <AdminFormField name="email" label="Email" required placeholder="user@example.com" type="email" value={formData.email} onChange={(val) => updateField('email', val)} disabled={!!editingItem} />
                    <AdminFormField name="role" label="Vai trò" required type="select" options={ROLE_OPTIONS} value={formData.role} onChange={(val) => updateField('role', val)} />
                    <AdminFormField
                        name="password"
                        label={editingItem ? 'Mật khẩu mới' : 'Mật khẩu'}
                        required={!editingItem}
                        placeholder={editingItem ? 'Để trống nếu không đổi mật khẩu' : 'Tối thiểu 6 ký tự'}
                        type="password"
                        value={formData.password}
                        onChange={(val) => updateField('password', val)}
                    />
                    {editingItem && (
                        <p className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
                            Email dùng làm định danh đăng nhập nên không chỉnh sửa trực tiếp tại đây.
                        </p>
                    )}
                    {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{error}</p>}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setModalOpen(false)} className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">Hủy</button>
                        <button type="submit" className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">{editingItem ? 'Cập nhật' : 'Tạo người dùng'}</button>
                    </div>
                </form>
            </AdminModal>

            <AdminDeleteConfirm
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                itemName={deleteTarget?.email || ''}
                loading={deleting}
            />
        </>
    )
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
