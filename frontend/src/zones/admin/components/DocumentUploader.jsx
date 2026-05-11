import { useState, useRef } from 'react'
import { uploadAdminDocument } from '../../../config/api'

export default function DocumentUploader({ onUploadSuccess }) {
    const [dragActive, setDragActive] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(null)
    const [result, setResult] = useState(null)
    const fileInputRef = useRef(null)

    const ALLOWED = ['.pdf', '.docx', '.doc', '.txt']

    function handleDrag(e) {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    async function uploadFile(file) {
        const ext = '.' + file.name.split('.').pop().toLowerCase()
        if (!ALLOWED.includes(ext)) {
            setResult({ type: 'error', message: `Loại file ${ext} không được hỗ trợ. Chỉ chấp nhận: PDF, DOCX, TXT.` })
            return
        }

        if (file.size > 100 * 1024 * 1024) {
            setResult({ type: 'error', message: 'File quá lớn. Giới hạn tối đa 100MB.' })
            return
        }

        setUploading(true)
        setResult(null)
        setUploadProgress(`Đang upload: ${file.name}...`)

        try {
            const createdDocument = await uploadAdminDocument(file)

            setResult({
                type: 'success',
                message: '✅ Upload tài liệu thành công.',
            })

            if (onUploadSuccess) {
                onUploadSuccess(createdDocument)
            }
        } catch (error) {
            setResult({
                type: 'error',
                message: `❌ ${error.message}`,
            })
        } finally {
            setUploading(false)
            setUploadProgress(null)
        }
    }

    function handleDrop(e) {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            uploadFile(e.dataTransfer.files[0])
        }
    }

    function handleFileSelect(e) {
        if (e.target.files && e.target.files[0]) {
            uploadFile(e.target.files[0])
        }
    }

    return (
        <div className="space-y-4">
            <div
                className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${dragActive
                    ? 'border-blue-400 bg-blue-50/50'
                    : 'border-slate-300 bg-slate-50/50 hover:border-slate-400 hover:bg-slate-100/50'
                    } ${uploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
                onClick={() => !uploading && fileInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    accept=".pdf,.docx,.doc,.txt"
                    className="hidden"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                    type="file"
                />

                <div className="flex flex-col items-center gap-3">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${dragActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                        <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-700">
                            {dragActive ? 'Thả file vào đây' : 'Kéo thả file hoặc click để chọn'}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            Hỗ trợ: PDF, DOCX, TXT — Tối đa 100MB
                        </p>
                    </div>
                </div>
            </div>

            {uploadProgress && (
                <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                    <svg className="h-5 w-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
                    </svg>
                    <span className="text-sm text-blue-700">{uploadProgress}</span>
                </div>
            )}

            {result && (
                <div className={`rounded-xl border px-4 py-3 text-sm ${result.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}>
                    {result.message}
                </div>
            )}
        </div>
    )
}
