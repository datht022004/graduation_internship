import { useEffect, useState } from 'react'
import { getUserHome } from '../../../../config/api'

export default function HomeTabPage() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        async function load() {
            try {
                const result = await getUserHome()
                if (!cancelled) setData(result)
            } catch (err) {
                console.error('Lỗi tải dữ liệu trang chủ:', err)
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

    const serviceCards = data.serviceCards || []
    const painPoints = data.painPoints || []
    const strengths = data.strengths || []

    return (
        <div className="flex flex-col gap-6 md:gap-10 pb-16">
            {/* Intro Section */}
            <section className="float-in stagger-1 relative overflow-hidden rounded-[40px] bg-[linear-gradient(135deg,#fff7ef,#ffe9db_35%,#f4f9ff_100%)] p-8 md:p-14 mx-4 mt-6 shadow-[0_20px_60px_-15px_rgba(242,104,42,0.15)] ring-1 ring-white">
                <div className="absolute -left-18 -top-16 h-56 w-56 rounded-full bg-[#f2682a]/30 blur-[80px]" />
                <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-[#13283c]/20 blur-[80px]" />
                
                <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                    <article className="rounded-[32px] border border-white/60 bg-white/70 p-8 shadow-[0_30px_60px_-20px_rgba(31,60,87,0.15)] backdrop-blur-md">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#fff2ea] px-3 py-1 mt-2 mb-4">
                            <span className="h-2 w-2 rounded-full bg-[#f2682a] animate-pulse" />
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f2682a]">Tăng trưởng bền vững</p>
                        </div>
                        <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold uppercase leading-[1.15] text-[#13283c]">
                            Mở khóa doanh thu<br/>
                            <span className="text-[#f2682a]">Scale nhanh hơn</span>
                        </h2>
                        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600">
                            Nền tảng dịch vụ tập trung vào mục tiêu mang lại giá trị thật: tăng cường lượng lead chất lượng cao, tối ưu hóa điểm chạm và chi phí, xây dựng một hệ thống marketing vận hành tự động và hiệu quả.
                        </p>
                        <div className="mt-8 grid gap-4 sm:grid-cols-3">
                            <div className="group rounded-2xl bg-[linear-gradient(145deg,#1f3c57,#0e1e2d)] p-5 text-white shadow-lg transition hover:-translate-y-1">
                                <p className="text-3xl font-black tracking-tight text-[#6dc8be]">360°</p>
                                <p className="mt-1 text-xs uppercase tracking-wider text-slate-300">Giải pháp toàn diện</p>
                            </div>
                            <div className="group rounded-2xl bg-[linear-gradient(145deg,#f2682a,#e3521b)] p-5 text-white shadow-lg transition hover:-translate-y-1">
                                <p className="text-3xl font-black tracking-tight text-[#ffe9db]">24/7</p>
                                <p className="mt-1 text-xs uppercase tracking-wider text-orange-200">Hỗ trợ chiến lược</p>
                            </div>
                            <div className="group rounded-2xl bg-white p-5 ring-1 ring-slate-200 shadow-lg transition hover:-translate-y-1">
                                <p className="text-3xl font-black tracking-tight text-[#13283c]">100%</p>
                                <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">Minh bạch KPI</p>
                            </div>
                        </div>
                    </article>

                    <article className="flex flex-col justify-center rounded-[32px] bg-[#0c1825] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                        <div className="relative z-10">
                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ffb35a]">Dành cho ai?</p>
                            <ul className="mt-6 flex flex-col gap-4">
                                {['Chủ doanh nghiệp vừa và nhỏ (SME)', 'Startup muốn mở rộng thị trường bùng nổ', 'Đội ngũ cần bộ máy Marketing chuyên nghiệp', 'Cá nhân muốn phát triển năng lực quản trị'].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 hover:border-[#f2682a]/50">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f2682a]/20 text-[#f2682a]">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        </span>
                                        <span className="text-sm font-medium leading-snug">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </article>
                </div>
            </section>

            {/* Services Grid Section */}
            <section className="float-in stagger-2 mx-auto w-full max-w-310 px-4">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold uppercase text-[#13283c]">Hệ sinh thái dịch vụ</h2>
                    <p className="mt-3 text-slate-500">Mọi công cụ bạn cần để vươn lên dẫn đầu ngành.</p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {serviceCards.map((card, index) => (
                        <article
                            className="group relative flex flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(242,104,42,0.15)] hover:border-[#f2682a]/30"
                            key={card.title}
                        >
                            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[radial-gradient(circle,#fff2ea_0%,transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#13283c] text-lg font-black text-white shadow-lg transition-transform group-hover:scale-110 group-hover:bg-[#f2682a]">
                                {String(index + 1).padStart(2, '0')}
                            </div>
                            <h3 className="text-xl font-bold uppercase leading-tight text-slate-900 group-hover:text-[#f2682a] transition-colors">{card.title}</h3>
                            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-500">{card.desc}</p>
                            <div className="mt-6 flex items-center gap-2 text-sm font-bold uppercase text-[#13283c] transition-colors group-hover:text-[#f2682a]">
                                <span>Khám phá ngay</span>
                                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* Team & Culture Section */}
            <section className="float-in stagger-3 mx-auto w-full max-w-310 px-4">
                <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                    <article className="group relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl">
                        <img
                            alt="Banner đội ngũ"
                            className="h-80 w-full object-cover transition-transform duration-700 group-hover:scale-105 md:h-[420px]"
                            loading="lazy"
                            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#09131e] via-[#13283c]/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 w-full p-8 text-white md:p-10">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md">
                                <span className="h-2 w-2 rounded-full bg-[#f2682a]" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-100">Văn hóa SEO VIP</p>
                            </div>
                            <h3 className="text-3xl font-bold uppercase tracking-wide md:text-4xl text-white drop-shadow-md">
                                Đồng hành <span className="text-[#f2682a]">sát cánh</span><br/>cùng tăng trưởng
                            </h3>
                            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-200 md:text-base">Chúng tôi không chỉ là agency, chúng tôi đóng vai trò như đội ngũ In-house của riêng bạn. Ám ảnh với KPI và chuyển đổi.</p>
                        </div>
                    </article>

                    <div className="flex flex-col gap-6">
                        <article className="group relative flex-1 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-lg">
                            <img
                                alt="Phân tích dữ liệu"
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                loading="lazy"
                                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80"
                            />
                            <div className="absolute inset-0 bg-[#13283c]/80 backdrop-blur-[2px] transition-opacity group-hover:bg-[#13283c]/90" />
                            <div className="relative flex h-full flex-col justify-end p-8 text-white">
                                <h4 className="text-xl font-bold uppercase text-[#6dc8be]">Data-Driven</h4>
                                <p className="mt-2 text-sm leading-relaxed text-slate-300">Team phân tích báo cáo và tối ưu hóa các điểm mù chỉ số minh bạch từng tuần.</p>
                            </div>
                        </article>
                        <article className="group relative flex-1 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-lg">
                            <img
                                alt="Họp chiến lược"
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                loading="lazy"
                                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80"
                            />
                            <div className="absolute inset-0 bg-[#f2682a]/80 backdrop-blur-[2px] transition-opacity group-hover:bg-[#f2682a]/90" />
                            <div className="relative flex h-full flex-col justify-end p-8 text-white">
                                <h4 className="text-xl font-bold uppercase text-white">Quy trình mượt mà</h4>
                                <p className="mt-2 text-sm leading-relaxed text-orange-100">Liên kết chặt chẽ SEO, Content và Design trong một luồng làm việc hiệu suất đỉnh cao.</p>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            {/* Painpoints & Solutions */}
            <section className="float-in stagger-3 px-4">
                <div className="mx-auto grid max-w-310 gap-8 lg:grid-cols-2">
                    <article className="flex flex-col justify-center rounded-[36px] bg-[#fdf2ee] p-8 md:p-12">
                        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                            🤔
                        </div>
                        <h3 className="text-3xl font-bold uppercase leading-tight text-[#13283c]">Bạn đang gặp<br/>những điểm nghẽn này?</h3>
                        <ul className="mt-8 space-y-4">
                            {painPoints.map((point, idx) => (
                                <li className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm" key={idx}>
                                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </article>

                    <article className="flex flex-col justify-center rounded-[36px] bg-[#13283c] p-8 text-white md:p-12 relative overflow-hidden shadow-2xl">
                        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#f2682a]/20 blur-3xl mix-blend-screen" />
                        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f2682a] text-3xl shadow-[0_0_20px_rgba(242,104,42,0.4)]">
                            💡
                        </div>
                        <h3 className="text-3xl font-bold uppercase leading-tight">Tại sao khách hàng<br/>chọn SEO VIP?</h3>
                        <ul className="mt-8 space-y-5">
                            {strengths.map((strength, index) => (
                                <li className="group flex text-sm text-slate-200 hover:text-white transition-colors" key={index}>
                                    <span className="mr-5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-lg font-black text-[#f68a44] transition-colors group-hover:bg-[#f68a44] group-hover:text-white">
                                        {index + 1}
                                    </span>
                                    <span className="flex-1 py-2 leading-relaxed">{strength}</span>
                                </li>
                            ))}
                        </ul>
                    </article>
                </div>
            </section>
        </div>
    )
}
