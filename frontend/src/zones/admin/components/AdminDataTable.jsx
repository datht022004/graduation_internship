import AdminEmptyState from './AdminEmptyState'

export default function AdminDataTable({ columns, data, onEdit, onDelete, loading, emptyMessage }) {
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
            <div className="hidden overflow-hidden rounded-xl border border-slate-200/80 sm:block">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                                >
                                    {col.label}
                                </th>
                            ))}
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((item) => (
                            <tr key={item.id} className="transition-colors hover:bg-slate-50/50">
                                {columns.map((col) => (
                                    <td key={col.key} className="px-4 py-3 text-sm text-slate-700">
                                        {col.render ? col.render(item[col.key], item) : item[col.key]}
                                    </td>
                                ))}
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button
                                            onClick={() => onEdit(item)}
                                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                            title="Sửa"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                                />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => onDelete(item)}
                                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                                            title="Xóa"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                                />
                                            </svg>
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
                    <div key={item.id} className="rounded-xl border border-slate-200/80 bg-white p-4">
                        <dl className="space-y-2">
                            {columns.map((col) => (
                                <div key={col.key}>
                                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">{col.label}</dt>
                                    <dd className="mt-0.5 text-sm text-slate-700">
                                        {col.render ? col.render(item[col.key], item) : item[col.key]}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                        <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                            <button
                                onClick={() => onEdit(item)}
                                className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
                            >
                                Sửa
                            </button>
                            <button
                                onClick={() => onDelete(item)}
                                className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-rose-500 transition-colors hover:bg-rose-50"
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
