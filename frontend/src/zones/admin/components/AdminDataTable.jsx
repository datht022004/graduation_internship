import AdminEmptyState from './AdminEmptyState'

export default function AdminDataTable({ columns, data, onView, showViewAction = true, onEdit, onDelete, loading, emptyMessage }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <svg className="h-6 w-6 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
            </div>
        )
    }

    if (!data || data.length === 0) {
        return <AdminEmptyState message={emptyMessage || 'Chưa có dữ liệu nào'} />
    }

    return (
        <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-xl border border-slate-300 sm:block">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide text-slate-500"
                                >
                                    {col.label}
                                </th>
                            ))}
                            <th className="px-4 py-3 text-right text-sm font-semibold uppercase tracking-wide text-slate-500">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {data.map((item) => (
                            <tr
                                key={item.id}
                                onClick={onView ? () => onView(item) : undefined}
                                className={`transition-all hover:bg-blue-100 hover:shadow-[inset_4px_0_0_#2563eb] ${onView ? 'cursor-pointer' : ''}`}
                            >
                                {columns.map((col) => (
                                    <td key={col.key} className="px-4 py-3 text-base text-slate-700">
                                        {col.render ? col.render(item[col.key], item) : item[col.key]}
                                    </td>
                                ))}
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {onView && showViewAction && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onView(item) }}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                                                title="Xem chi tiết"
                                            >
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>Xem</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEdit(item) }}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                                            title="Sửa"
                                        >
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                                />
                                            </svg>
                                            <span>Sửa</span>
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete(item) }}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                                            title="Xóa"
                                        >
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                                />
                                            </svg>
                                            <span>Xóa</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col gap-3 sm:hidden">
                {data.map((item) => (
                    <div
                        key={item.id}
                        onClick={onView ? () => onView(item) : undefined}
                        className={`rounded-xl border border-slate-300 bg-white p-4 ${onView ? 'cursor-pointer transition-colors hover:border-blue-300 hover:bg-blue-50' : ''}`}
                    >
                        <dl className="space-y-2">
                            {columns.map((col) => (
                                <div key={col.key}>
                                    <dt className="text-sm font-semibold uppercase tracking-wide text-slate-400">{col.label}</dt>
                                    <dd className="mt-0.5 text-base text-slate-700">
                                        {col.render ? col.render(item[col.key], item) : item[col.key]}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                        <div className="mt-3 flex gap-2 border-t border-slate-300 pt-3">
                            {onView && showViewAction && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onView(item) }}
                                    className="flex-1 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                                >
                                    Xem
                                </button>
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(item) }}
                                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                            >
                                Sửa
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(item) }}
                                className="flex-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-600 transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
