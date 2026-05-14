export default function AdminPageHeader({ title, subtitle, actions }) {
    return (
        <div className="sticky top-0 z-10 border-b border-slate-300 bg-white/80 px-4 py-4 backdrop-blur-xl sm:px-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">{title}</h1>
                    {subtitle && <p className="mt-0.5 text-base text-slate-500">{subtitle}</p>}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
        </div>
    )
}
