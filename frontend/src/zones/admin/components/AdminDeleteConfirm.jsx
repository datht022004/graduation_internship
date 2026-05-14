import AdminConfirmDialog from './AdminConfirmDialog'

export default function AdminDeleteConfirm({ isOpen, onClose, onConfirm, itemName, loading }) {
    return (
        <AdminConfirmDialog
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Xác nhận xóa"
            message={(
                <>
                    <span className="mb-1 block font-semibold text-slate-800">Bạn có chắc muốn xóa?</span>
                    <span>
                        <span className="font-medium text-slate-700">{itemName}</span> sẽ bị xóa vĩnh viễn và không thể hoàn tác.
                    </span>
                </>
            )}
            confirmLabel="Xóa"
            loadingLabel="Đang xóa..."
            loading={loading}
            tone="danger"
        />
    )
}
