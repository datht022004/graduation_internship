import { useEffect, useState } from 'react'
import { getUserAds } from '../../../../config/api'

export default function AdsTabPage({ onChatClick }) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        async function load() {
            try {
                const result = await getUserAds()
                if (!cancelled) setData(result)
            } catch (err) {
                console.error('Lỗi tải dữ liệu Ads:', err)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center py-32">
                <svg className="h-8 w-8 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
            </div>
        )
    }

    if (!data) {
        return <div className="py-32 text-center text-slate-400">Không thể tải dữ liệu.</div>
    }

    const metrics = data.metrics || []
    const channels = data.channels || []

    return (
        <div className="flex flex-col gap-6 md:gap-10 pb-16">
            {/* Hero Introduction */}
            <section className="float-in stagger-1 relative overflow-hidden rounded-[40px] bg-[#090f1a] px-6 py-14 md:py-20 mx-4 mt-6 shadow-[0_30px_60px_-15px_rgba(14,165,233,0.25)] border border-slate-800">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_25%,rgba(14,165,233,0.15),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.12),transparent_30%),radial-gradient(circle_at_60%_90%,rgba(242,104,42,0.1),transparent_35%)]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] opacity-30 mix-blend-overlay" />
                
                <div className="relative z-10 mx-auto max-w-310">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 mb-6 backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">Performance Dashboard</p>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-[1.1] tracking-tight text-white drop-shadow-lg">
                            Quảng cáo đa kênh<br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-200">Đo lường thời gian thực</span>
                        </h2>
                        <p className="mt-6 mx-auto max-w-2xl text-lg text-slate-300 leading-relaxed font-medium">Bứt tốc doanh thu với các chiến dịch chuyển đổi cao. Mọi chi phí, CPL và tín hiệu của tệp khách hàng được theo dõi sát sao 24/7 để tối ưu ngay tức khắc.</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3 mb-16">
                        {metrics.map((metric, idx) => (
                            <article className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:border-cyan-500/40" key={metric.label}>
                                <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-cyan-500/20 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-cyan-400 border border-white/5 shadow-inner group-hover:bg-cyan-500/20 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Metric 0{idx + 1}</span>
                                </div>
                                <p className="relative text-4xl md:text-5xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">{metric.value}</p>
                                <p className="relative mt-2 text-sm font-semibold uppercase tracking-wider text-emerald-300">{metric.label}</p>
                            </article>
                        ))}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {channels.map((channel) => (
                            <article className="group flex flex-col justify-between rounded-[32px] border border-slate-700 bg-gradient-to-b from-[#101b2e] to-[#0a111f] p-8 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-emerald-500/50 hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.15)] relative overflow-hidden" key={channel.name}>
                                <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-slate-800/50 transition-colors group-hover:bg-emerald-900/40" />
                                <div className="relative z-10">
                                    <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-6 backdrop-blur-sm">KPI: {channel.kpi}</span>
                                    <h3 className="text-2xl font-bold uppercase text-white group-hover:text-emerald-300 transition-colors">{channel.name}</h3>
                                    <p className="mt-4 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">{channel.desc}</p>
                                </div>
                                <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-500 opacity-60 transition-opacity group-hover:opacity-100">
                                    <span>Chiến lược {channel.name.split(' ')[0]}</span>
                                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Dashboard Action Section */}
            <section className="float-in stagger-2 px-4">
                <article className="mx-auto flex w-full max-w-310 flex-col justify-between gap-8 rounded-[40px] border border-cyan-500/30 bg-[linear-gradient(150deg,#0f172a,#082f49)] p-8 md:p-14 text-white shadow-[0_30px_60px_rgba(14,165,233,0.25)] relative overflow-hidden md:flex-row md:items-center">
                    <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-cyan-400/20 blur-[100px]" />
                    <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-teal-400/10 blur-[100px]" />
                    
                    <div className="relative z-10 flex-1 max-w-2xl">
                        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.5)]">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-black uppercase leading-tight tracking-wide drop-shadow-md">Dashboard theo dõi chiến dịch 24/7</h3>
                        <p className="mt-4 text-base md:text-lg text-cyan-50 leading-relaxed font-medium">Tổng hợp chi phí, CPL, ROAS, và creative performance theo từng kênh. Báo cáo tự động giúp bạn ra quyết định nhanh chóng mà không cần chờ đến cuối tuần.</p>
                    </div>

                    <div className="relative z-10 flex shrink-0 flex-col gap-4">
                        <button className="flex w-full items-center justify-center gap-3 rounded-full bg-cyan-400 px-8 py-5 text-sm font-black uppercase text-slate-900 transition-transform hover:scale-[1.03] shadow-[0_0_20px_rgba(34,211,238,0.4)]" onClick={onChatClick} type="button">
                            <span>Nhận Mẫu Dashboard</span>
                            <svg className="w-5 h-5 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                        </button>
                        <p className="text-center text-[11px] font-bold uppercase tracking-widest text-cyan-200/70">Hoàn toàn miễn phí</p>
                    </div>
                </article>
            </section>
        </div>
    )
}
