import { useEffect, useState } from 'react'
import { getUserWebDesign } from '../../../../config/api'

export default function WebDesignTabPage({ onChatClick }) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        async function load() {
            try {
                const result = await getUserWebDesign()
                if (!cancelled) setData(result)
            } catch (err) {
                console.error('Lỗi tải dữ liệu Web Design:', err)
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

    const phases = data.phases || []
    const highlights = data.highlights || []

    return (
        <div className="flex flex-col gap-6 md:gap-10 pb-16">
            {/* Hero Introduction */}
            <section className="float-in stagger-1 relative overflow-hidden rounded-[40px] bg-[linear-gradient(135deg,#f0f9ff,#e0f2fe_45%,#eff6ff)] px-6 py-14 md:py-20 mx-4 mt-6 shadow-[0_30px_60px_-15px_rgba(2,132,199,0.15)] ring-1 ring-white">
                <div className="absolute -left-18 -top-16 h-56 w-56 rounded-full bg-sky-400/20 blur-[80px]" />
                <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-[80px]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/connected.png')] opacity-[0.03]" />
                
                <div className="relative z-10 mx-auto max-w-310">
                    <div className="rounded-[36px] bg-white/60 p-8 md:p-12 shadow-2xl backdrop-blur-md border border-white/60 mb-12">
                        <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1.5 mb-6 shadow-sm">
                            <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">Website Conversion Lab</p>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-[1.1] text-slate-900 tracking-tight">
                            Thiết kế Website<br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">Tối ưu chuyển đổi</span>
                        </h2>
                        <p className="mt-5 max-w-3xl text-lg text-slate-600 leading-relaxed">
                            Web đẹp thôi chưa đủ. Chúng tôi thiết kế website dựa trên hành trình khách hàng (Customer Journey), tối ưu hóa luồng UI/UX để biến người truy cập thành leads chất lượng.
                        </p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <article className="group relative overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-[0_20px_40px_-15px_rgba(2,132,199,0.15)]">
                            <img
                                alt="Banner văn phòng công ty"
                                className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-105 md:h-80"
                                loading="lazy"
                                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#082f49]/90 via-[#082f49]/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-8 text-white relative z-10 w-full">
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 mb-3 backdrop-blur-md">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Digital Workspace</p>
                                </div>
                                <h4 className="text-2xl font-bold uppercase md:text-3xl text-white drop-shadow-md">Tập trung mục tiêu cốt lõi</h4>
                            </div>
                        </article>

                        <article className="group relative overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-[0_20px_40px_-15px_rgba(2,132,199,0.1)] flex flex-col">
                            <img
                                alt="Team UX UI"
                                className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                loading="lazy"
                                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80"
                            />
                            <div className="flex-1 p-6 md:p-8 bg-white relative z-10">
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-600 mb-2">Design & SEO Sync</p>
                                <p className="text-sm font-medium leading-relaxed text-slate-700">Team Design, Content và SEO làm việc chung một luồng, đảm bảo website xuất xưởng vừa thẩm mỹ vừa thân thiện với Google.</p>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            {/* Implementation Phases */}
            <section className="float-in stagger-2 mx-auto w-full max-w-310 px-4">
                <div className="mb-10 text-center">
                    <h3 className="text-3xl font-black uppercase text-[#082f49]">Quy trình thực thi chuẩn</h3>
                    <p className="mt-2 text-slate-500">Milestone minh bạch, kiểm soát tiến độ từng tuần.</p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {phases.map((phase, index) => (
                        <article className="group relative overflow-hidden rounded-[32px] border border-sky-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(2,132,199,0.15)] hover:border-sky-300" key={phase.title}>
                            <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-[40px] bg-gradient-to-bl from-sky-50 to-transparent transition-transform duration-500 group-hover:scale-150" />
                            
                            <div className="relative mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#082f49] text-xl font-black text-white shadow-lg transition-transform group-hover:scale-110 group-hover:bg-sky-500">
                                {index + 1}
                            </div>
                            
                            <h3 className="relative text-xl font-bold uppercase leading-tight text-slate-900 group-hover:text-sky-600 transition-colors">{phase.title}</h3>
                            <p className="relative mt-3 h-20 text-sm leading-relaxed text-slate-500">{phase.desc}</p>
                            
                            <div className="relative mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-sky-700 opacity-60 transition-opacity group-hover:opacity-100">
                                <span>Milestone {index + 1}</span>
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* Highlights & CTA */}
            <section className="float-in stagger-3 px-4">
                <div className="mx-auto grid max-w-310 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <article className="rounded-[36px] border border-slate-200 bg-white p-8 md:p-12 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.1)]">
                        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-3xl text-sky-500 shadow-inner">
                            🎯
                        </div>
                        <h3 className="text-3xl font-black uppercase text-slate-900">Chuẩn mực cốt lõi</h3>
                        <ul className="mt-8 space-y-4">
                            {highlights.map((item) => (
                                <li className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-sky-50/50" key={item}>
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                                    </span>
                                    <span className="text-sm font-medium text-slate-700">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </article>

                    <article className="flex flex-col justify-center rounded-[36px] bg-[linear-gradient(160deg,#082f49,#0284c7)] p-8 md:p-12 text-white shadow-[0_30px_60px_rgba(2,132,199,0.3)] relative overflow-hidden">
                        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-400/30 blur-[80px]" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-20 mix-blend-overlay" />
                        
                        <div className="relative z-10">
                            <span className="inline-flex items-center justify-center rounded-2xl bg-white/10 p-4 mb-6 shadow-lg backdrop-blur-md">
                                <svg className="w-8 h-8 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                            </span>
                            <h3 className="text-3xl md:text-4xl font-black uppercase leading-tight text-white drop-shadow-md">Cần Redesign Website hiện tại?</h3>
                            <p className="mt-5 text-base text-sky-100 leading-relaxed font-medium">Giao diện cũ? Load chậm? Tỷ lệ thoát trang ở mức báo động? Gửi URL cho team chuyên gia của chúng tôi đánh giá ngay.</p>
                            
                            <div className="mt-8 mb-8 inline-flex items-center gap-3 rounded-full border border-sky-400/40 bg-sky-900/40 px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-sky-200 backdrop-blur-sm">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                Miễn phí Report UX/UI (48H)
                            </div>
                            
                            <button className="flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-4 text-sm font-black uppercase text-sky-800 transition-transform hover:scale-[1.02] shadow-xl" onClick={onChatClick} type="button">
                                <span>Gửi Website Cho Chuyên Gia</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                            </button>
                        </div>
                    </article>
                </div>
            </section>
        </div>
    )
}
