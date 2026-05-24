import React, { useEffect } from 'react'

export default function CompanyProfilePage({ onBack }) {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    return (
        <article className="float-in mx-auto w-full max-w-7xl px-3 py-6 sm:px-4 sm:py-8 md:py-12">
            {/* Back Action */}
            <div className="mb-8 flex justify-between items-center">
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:border-[#f2682a]/40 hover:text-[#f2682a]"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Quay lại
                </button>
            </div>

            <div className="relative flex w-full flex-col overflow-hidden rounded-[28px] bg-[#0b131e] shadow-2xl ring-1 ring-slate-200 md:rounded-[36px]">

                {/* Hero Section */}
                <div className="relative flex min-h-[38vh] flex-col justify-center px-5 py-14 text-center sm:px-8 sm:py-20 md:min-h-[50vh] md:px-20">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(242,104,42,0.15),transparent_60%)]" />
                    <div className="relative z-10 mx-auto max-w-4xl">
                        <span className="mb-4 inline-block rounded-full border border-[#f2682a]/30 bg-[#f2682a]/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-[#f2682a]">
                            Company Profile 2026
                        </span>
                        <h2 className="text-3xl font-black uppercase leading-tight text-white sm:text-4xl md:text-6xl lg:text-7xl">
                            Đối tác <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f2682a] to-[#ffb35a]">tăng trưởng</span> số 1 của bạn
                        </h2>
                        <p className="mt-6 text-lg font-medium text-slate-400 md:text-xl leading-relaxed">
                            Không chỉ là Agency, chúng tôi đóng vai trò như một phòng Marketing In-house của riêng bạn. Ám ảnh với KPI, tối ưu chi phí và tăng tỷ lệ chuyển đổi.
                        </p>
                    </div>
                </div>

                {/* Metrics Section */}
                <div className="border-y border-white/5 bg-white/[0.02] py-10 sm:py-16">
                    <div className="mx-auto grid max-w-6xl gap-6 px-5 sm:grid-cols-2 sm:px-8 md:grid-cols-4 md:gap-8">
                        {[
                            { number: '250+', label: 'Dự án thành công', color: 'text-[#f2682a]' },
                            { number: '95%', label: 'Khách hàng gia hạn', color: 'text-[#6dc8be]' },
                            { number: '3.5x', label: 'Tăng trưởng trung bình', color: 'text-[#ffb35a]' },
                            { number: '24/7', label: 'Support & Monitor', color: 'text-white' },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <p className={`text-4xl font-black md:text-6xl ${stat.color}`}>{stat.number}</p>
                                <p className="mt-2 text-sm font-bold uppercase tracking-widest text-slate-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Core Capabilities */}
                <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 md:px-20 md:py-20">
                    <h3 className="mb-12 text-center text-3xl font-black uppercase text-white md:text-4xl">Năng lực cốt lõi</h3>
                    <div className="grid gap-6 md:grid-cols-3">
                        {[
                            { title: 'SEO Tổng thể', desc: 'Sở hữu mạng lưới backlink độc quyền, quy trình on-page chuẩn quốc tế. Đảm bảo lên TOP bền vững, không sợ thuật toán.' },
                            { title: 'Tối ưu CRO', desc: 'Phân tích bản đồ nhiệt (Heatmap), A/B testing liên tục để biến mỗi lượt truy cập thành một đơn hàng tiềm năng.' },
                            { title: 'Ads Chuyển đổi', desc: 'Hệ thống tracking sâu, thiết lập phễu bám đuổi (Remarketing) tinh gọn giúp giảm 30% giá CPL trong tháng đầu tiên.' },
                        ].map((service, i) => (
                            <div key={i} className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition hover:bg-white/10 hover:border-[#f2682a]/50">
                                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#f2682a]/20 text-2xl font-black text-[#f2682a]">
                                    0{i + 1}
                                </div>
                                <h4 className="mb-4 text-xl font-bold text-white">{service.title}</h4>
                                <p className="text-sm leading-relaxed text-slate-400">{service.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Featured Case Study */}
                <div className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 md:px-20 md:pb-24 md:pt-10">
                    <div className="overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#1f3c57,#0e1e2d)] p-1 md:rounded-[40px]">
                        <div className="rounded-[24px] bg-[#0b131e] p-5 sm:p-8 md:rounded-[36px] md:p-12 lg:flex lg:items-center lg:gap-12">
                            <div className="lg:w-1/2">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#6dc8be]">Case Study Tiêu Biểu</span>
                                <h3 className="mt-4 text-2xl font-black leading-tight text-white sm:text-3xl md:text-5xl">
                                    Tăng trưởng <span className="text-[#6dc8be]">400%</span> traffic organic sau 6 tháng
                                </h3>
                                <p className="mt-6 text-slate-400 leading-relaxed">
                                    Đối tác giáo dục E-learning gặp tình trạng kẹt traffic ở mức 10.000/tháng suốt 1 năm. Chúng tôi vào cuộc cấu trúc lại Silo content, xử lý technical nợ đọng và build mảng Entity authority.
                                </p>
                                <ul className="mt-8 space-y-4 text-sm font-medium text-white">
                                    <li className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-[#6dc8be]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                        Từ 10K lên 52K Traffic/tháng
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-[#6dc8be]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                        Top 1 từ khóa ngành "Học tiếng Anh online"
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-[#6dc8be]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                        Tăng 150% số lượng form đăng ký
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-12 lg:mt-0 lg:w-1/2">
                                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                                    {/* Mock chart background */}
                                    <div className="absolute inset-0 bg-[#13283c] flex flex-col justify-end p-6">
                                        <div className="flex items-end gap-2 h-full opacity-80">
                                            {[20, 30, 25, 40, 60, 80, 120, 180, 240, 320, 400].map((h, i) => (
                                                <div key={i} className="flex-1 bg-gradient-to-t from-[#6dc8be]/20 to-[#6dc8be] rounded-t-sm transition-all duration-1000 animate-in slide-in-from-bottom-full" style={{ height: `${(h / 400) * 100}%`, animationDelay: `${i * 100}ms` }} />
                                            ))}
                                        </div>
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </article>
    )
}
