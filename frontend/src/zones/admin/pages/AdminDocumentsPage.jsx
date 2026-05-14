import { useCallback, useEffect, useState } from 'react'
import DocumentUploader from '../components/DocumentUploader'
import DocumentList from '../components/DocumentList'
import AdminPageHeader from '../components/AdminPageHeader'
import { getAdminDocumentPage } from '../../../config/api'

const PAGE_SIZE = 5

export default function AdminDocumentsPage() {
    const [documents, setDocuments] = useState([])
    const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 1 })
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)

    const fetchDocuments = useCallback(async (targetPage = page) => {
        setLoading(true)
        try {
            const data = await getAdminDocumentPage({ page: targetPage, pageSize: PAGE_SIZE })
            setDocuments(data.documents)
            setPagination(data)
        } catch (error) {
            console.error('Lỗi tải danh sách tài liệu:', error)
        } finally {
            setLoading(false)
        }
    }, [page])

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
                        className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
                        onClick={fetchDocuments}
                        type="button"
                    >
                        Làm mới
                    </button>
                }
            />

            <div className="w-full px-6 py-6 lg:px-8">
                <div className="mb-6 rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Upload tài liệu</h2>
                    </div>
                    <DocumentUploader
                        onUploadSuccess={() => {
                            setPage(1)
                            fetchDocuments(1)
                        }}
                    />
                </div>

                <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                            <svg className="h-5 w-5 text-violet-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Tài liệu đã nạp</h2>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-semibold text-slate-600">
                            {pagination.total}
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
                        <DocumentList
                            documents={documents}
                            onDocumentDeleted={() => {
                                if (documents.length === 1 && page > 1) {
                                    setPage((value) => Math.max(value - 1, 1))
                                    return
                                }
                                fetchDocuments()
                            }}
                        />
                    )}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                        <p className="text-sm font-medium text-slate-500">
                            Trang {pagination.page} / {pagination.totalPages} · Tổng {pagination.total} tài liệu
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={pagination.page <= 1 || loading}
                                onClick={() => setPage((value) => Math.max(value - 1, 1))}
                                type="button"
                            >
                                Trước
                            </button>
                            <button
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
        </>
    )
}
