export default function AdminPageHeader({ title, subtitle, actions }) {
    return (
        <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/80 px-4 py-4 backdrop-blur-xl sm:px-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-bold text-slate-800">{title}</h1>
                    {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
        </div>
    )
}
