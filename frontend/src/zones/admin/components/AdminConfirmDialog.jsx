import AdminModal from './AdminModal'

const TONES = {
    danger: {
        iconBg: 'bg-rose-100',
        iconText: 'text-rose-600',
        button: 'bg-rose-600 hover:bg-rose-700',
    },
    warning: {
        iconBg: 'bg-amber-100',
        iconText: 'text-amber-700',
        button: 'bg-amber-600 hover:bg-amber-700',
    },
}

export default function AdminConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'Xác nhận',
    message,
    confirmLabel = 'Xác nhận',
    loadingLabel = 'Đang xử lý...',
    loading = false,
    tone = 'danger',
}) {
    const style = TONES[tone] || TONES.danger

    return (
        <AdminModal isOpen={isOpen} onClose={loading ? () => {} : onClose} title={title} size="sm">
            <div className="text-center">
                <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${style.iconBg}`}>
                    <svg className={`h-6 w-6 ${style.iconText}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        />
                    </svg>
                </div>
                <p className="mb-5 text-sm leading-6 text-slate-500">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 ${style.button}`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                                {loadingLabel}
                            </span>
                        ) : (
                            confirmLabel
                        )}
                    </button>
                </div>
            </div>
        </AdminModal>
    )
}
