import { useCallback, useEffect, useState } from 'react'
import DocumentUploader from '../components/DocumentUploader'
import DocumentList from '../components/DocumentList'
import AdminPageHeader from '../components/AdminPageHeader'
import { getAdminDocuments } from '../../../config/api'

export default function AdminDocumentsPage() {
    const [documents, setDocuments] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchDocuments = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getAdminDocuments()
            setDocuments(data)
        } catch (error) {
            console.error('Lỗi tải danh sách tài liệu:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDocuments()
    }, [fetchDocuments])

    return (
        <>
            <AdminPageHeader
                title="Tài liệu RAG"
                subtitle="Upload và quản lý tài liệu cho chatbot AI"
                actions={
                    <button
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
                        onClick={fetchDocuments}
                        type="button"
                    >
                        Làm mới
                    </button>
                }
            />

            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
                <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                            <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                        </div>
                        <h2 className="text-base font-bold text-slate-900">Upload tài liệu</h2>
                    </div>
                    <DocumentUploader onUploadSuccess={fetchDocuments} />
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                            <svg className="h-4 w-4 text-violet-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                        </div>
                        <h2 className="text-base font-bold text-slate-900">Tài liệu đã nạp</h2>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                            {documents.length}
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <svg className="h-6 w-6 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                        </div>
                    ) : (
                        <DocumentList documents={documents} onDocumentDeleted={(id) => setDocuments((prev) => prev.filter((d) => d.id !== id))} />
                    )}
                </div>
            </div>
        </>
    )
}
