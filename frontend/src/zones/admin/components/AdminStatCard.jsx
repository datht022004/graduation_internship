const COLOR_MAP = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'bg-blue-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'bg-emerald-100' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', icon: 'bg-violet-100' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', icon: 'bg-rose-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'bg-amber-100' },
}

export default function AdminStatCard({ label, value, icon, color = 'blue' }) {
    const c = COLOR_MAP[color] || COLOR_MAP.blue

    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.icon} ${c.text}`}>{icon}</div>
                <div>
                    <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
                    <p className="text-xs text-slate-500">{label}</p>
                </div>
            </div>
        </div>
    )
}
