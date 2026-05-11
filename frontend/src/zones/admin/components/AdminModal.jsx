import { useEffect } from 'react'

export default function AdminModal({ isOpen, onClose, title, children, size = 'md' }) {
    useEffect(() => {
        if (!isOpen) return
        function handleEsc(e) {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleEsc)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', handleEsc)
            document.body.style.overflow = ''
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const sizeClass = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-2xl' : size === 'xl' ? 'max-w-4xl' : 'max-w-lg'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="modal-overlay-enter fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
            <div className={`modal-content-enter relative flex max-h-[92vh] w-full flex-col ${sizeClass} rounded-2xl bg-white shadow-xl`}>
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="overflow-y-auto px-6 py-5">{children}</div>
            </div>
        </div>
    )
}
