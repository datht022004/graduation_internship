import { useState } from 'react'
import { deleteAdminDocument } from '../../../config/api'

function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(isoString) {
    try {
        return new Date(isoString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    } catch {
        return isoString
    }
}

const FILE_TYPE_ICONS = {
    pdf: { bg: 'bg-rose-100', text: 'text-rose-600', label: 'PDF' },
    docx: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'DOCX' },
    txt: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'TXT' },
}

export default function DocumentList({ documents, onDocumentDeleted }) {
    const [deletingId, setDeletingId] = useState(null)

    async function handleDelete(docId, filename) {
        if (!confirm(`Bạn có chắc muốn xóa tài liệu "${filename}"?`)) {
            return
        }

        setDeletingId(docId)
        try {
            await deleteAdminDocument(docId)

            if (onDocumentDeleted) {
                onDocumentDeleted(docId)
            }
        } catch (error) {
            alert(`Lỗi: ${error.message}`)
        } finally {
            setDeletingId(null)
        }
    }

    if (!documents || documents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-14">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                    <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                </div>
                <p className="mt-4 text-base font-medium text-slate-500">Chưa có tài liệu nào</p>
                <p className="mt-1 text-sm text-slate-400">Upload tài liệu để bắt đầu sử dụng chatbot</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {documents.map((doc) => {
                const typeStyle = FILE_TYPE_ICONS[doc.file_type] || FILE_TYPE_ICONS.txt
                const isDeleting = deletingId === doc.id

                return (
                    <div
                        className={`flex items-center gap-4 rounded-xl border border-slate-300 bg-white px-5 py-4 transition-all hover:border-slate-300 hover:shadow-sm ${isDeleting ? 'opacity-50' : ''}`}
                        key={doc.id}
                    >
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${typeStyle.bg}`}>
                            <span className={`text-sm font-bold ${typeStyle.text}`}>{typeStyle.label}</span>
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-base font-semibold text-slate-800">{doc.filename}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-slate-500">
                                <span>{formatFileSize(doc.file_size)}</span>
                                <span>•</span>
                                <span>{doc.chunk_count} chunks</span>
                                <span>•</span>
                                <span>{formatDate(doc.uploaded_at)}</span>
                            </div>
                        </div>

                        <button
                            className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 disabled:cursor-not-allowed"
                            disabled={isDeleting}
                            onClick={() => handleDelete(doc.id, doc.filename)}
                            title="Xóa tài liệu"
                            type="button"
                        >
                            {isDeleting ? (
                                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                            )}
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
