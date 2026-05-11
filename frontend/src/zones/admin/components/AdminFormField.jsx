export default function AdminFormField({ label, name, type = 'text', value, onChange, error, placeholder, required, rows = 3, options = [] }) {
    const baseClass =
        'w-full rounded-xl border px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'
    const borderClass = error ? 'border-rose-300 bg-rose-50/30' : 'border-slate-300 bg-white'

    if (type === 'checkbox') {
        return (
            <label className="flex items-center gap-2.5 py-1">
                <input
                    type="checkbox"
                    name={name}
                    checked={!!value}
                    onChange={(e) => onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                />
                <span className="text-sm font-medium text-slate-700">{label}</span>
            </label>
        )
    }

    if (type === 'textarea') {
        return (
            <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    {label}
                    {required && <span className="ml-0.5 text-rose-500">*</span>}
                </label>
                <textarea
                    name={name}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={rows}
                    className={`${baseClass} ${borderClass} resize-none`}
                />
                {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
            </div>
        )
    }

    if (type === 'select') {
        return (
            <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    {label}
                    {required && <span className="ml-0.5 text-rose-500">*</span>}
                </label>
                <select
                    name={name}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className={`${baseClass} ${borderClass}`}
                    required={required}
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
            </div>
        )
    }

    if (type === 'array') {
        const arrayValue = Array.isArray(value) ? value.join('\n') : value || ''
        return (
            <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    {label}
                    {required && <span className="ml-0.5 text-rose-500">*</span>}
                </label>
                <textarea
                    name={name}
                    value={arrayValue}
                    onChange={(e) => {
                        const lines = e.target.value.split('\n')
                        onChange(lines)
                    }}
                    placeholder={placeholder || 'Mỗi dòng là một mục'}
                    rows={rows}
                    className={`${baseClass} ${borderClass} resize-none`}
                />
                <p className="mt-1 text-xs text-slate-400">Mỗi dòng là một mục riêng biệt</p>
                {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
            </div>
        )
    }

    return (
        <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                {label}
                {required && <span className="ml-0.5 text-rose-500">*</span>}
            </label>
            <input
                type={type}
                name={name}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`${baseClass} ${borderClass}`}
            />
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
        </div>
    )
}
