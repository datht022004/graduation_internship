import React, { useEffect } from 'react'

export default function CompanyProfileModal({ onClose }) {
    // Lock body scroll when open
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = 'auto'
        }
    }, [])

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 md:p-8 backdrop-blur-xl transition-opacity animate-in fade-in duration-300">
            <div className="relative flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-[36px] border border-white/10 bg-[#0b131e] shadow-2xl ring-1 ring-white/10">
                
                {/* Header Actions */}
                <div className="absolute top-6 right-6 z-20 flex gap-4">
                    <button 
                        onClick={() => window.print()} 
                        className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                        title="Tải PDF / In hồ sơ"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                        <span className="hidden sm:inline">Tải PDF</span>
                    </button>
                    <button 
                        onClick={onClose} 
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white backdrop-blur-md transition hover:bg-red-500 hover:text-white"
                        title="Đóng"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                {/* Content Container (Scrollable) */}
                <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
                    {/* Hero Section */}
                    <div className="relative flex min-h-[50vh] flex-col justify-center px-8 py-20 text-center md:px-20">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(242,104,42,0.15),transparent_60%)]" />
                        <div className="relative z-10 mx-auto max-w-4xl">
                            <span className="mb-4 inline-block rounded-full border border-[#f2682a]/30 bg-[#f2682a]/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-[#f2682a]">
                                Company Profile 2026
                            </span>
                            <h2 className="text-4xl font-black uppercase leading-tight text-white md:text-6xl lg:text-7xl">
                                Đối tác <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f2682a] to-[#ffb35a]">tăng trưởng</span> số 1 của bạn
                            </h2>
                            <p className="mt-6 text-lg font-medium text-slate-400 md:text-xl leading-relaxed">
                                Không chỉ là Agency, chúng tôi đóng vai trò như một phòng Marketing In-house của riêng bạn. Ám ảnh với KPI, tối ưu chi phí và tăng tỷ lệ chuyển đổi.
                            </p>
                        </div>
                    </div>

                    {/* Metrics Section */}
                    <div className="border-y border-white/5 bg-white/[0.02] py-16">
                        <div className="mx-auto grid max-w-6xl gap-8 px-8 sm:grid-cols-2 md:grid-cols-4">
                            {[
                                { number: '250+', label: 'Dự án thành công', color: 'text-[#f2682a]' },
                                { number: '95%', label: 'Khách hàng gia hạn', color: 'text-[#6dc8be]' },
                                { number: '3.5x', label: 'Tăng trưởng trung bình', color: 'text-[#ffb35a]' },
                                { number: '24/7', label: 'Support & Monitor', color: 'text-white' },
                            ].map((stat, i) => (
                                <div key={i} className="text-center">
                                    <p className={`text-5xl font-black md:text-6xl ${stat.color}`}>{stat.number}</p>
                                    <p className="mt-2 text-sm font-bold uppercase tracking-widest text-slate-500">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Core Capabilities */}
                    <div className="py-20 px-8 md:px-20 mx-auto max-w-7xl">
                        <h3 className="mb-12 text-center text-3xl font-black uppercase text-white md:text-4xl">Năng lực cốt lõi</h3>
                        <div className="grid gap-6 md:grid-cols-3">
                            {[
                                { title: 'SEO Tổng thể', desc: 'Sở hữu mạng lưới backlink độc quyền, quy trình on-page chuẩn quốc tế. Đảm bảo lên TOP bền vững, không sợ thuật toán.' },
                                { title: 'Tối ưu CRO', desc: 'Phân tích bản đồ nhiệt (Heatmap), A/B testing liên tục để biến mỗi lượt truy cập thành một đơn hàng tiềm năng.' },
                                { title: 'Ads Chuyển đổi', desc: 'Hệ thống tracking sâu, thiết lập phễu bám đuổi (Remarketing) tinh gọn giúp giảm 30% giá CPL trong tháng đầu tiên.' },
                            ].map((service, i) => (
                                <div key={i} className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition hover:bg-white/10 hover:border-[#f2682a]/50">
                                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#f2682a]/20 text-2xl font-black text-[#f2682a]">
                                        0{i+1}
                                    </div>
                                    <h4 className="mb-4 text-xl font-bold text-white">{service.title}</h4>
                                    <p className="text-sm leading-relaxed text-slate-400">{service.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Featured Case Study */}
                    <div className="px-8 pb-24 pt-10 md:px-20 mx-auto max-w-7xl">
                        <div className="overflow-hidden rounded-[40px] bg-[linear-gradient(135deg,#1f3c57,#0e1e2d)] p-1">
                            <div className="rounded-[36px] bg-[#0b131e] p-8 md:p-12 lg:flex lg:items-center lg:gap-12">
                                <div className="lg:w-1/2">
                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-[#6dc8be]">Case Study Tiêu Biểu</span>
                                    <h3 className="mt-4 text-3xl font-black leading-tight text-white md:text-5xl">
                                        Tăng trưởng <span className="text-[#6dc8be]">400%</span> traffic organic sau 6 tháng
                                    </h3>
                                    <p className="mt-6 text-slate-400 leading-relaxed">
                                        Đối tác giáo dục E-learning gặp tình trạng kẹt traffic ở mức 10.000/tháng suốt 1 năm. Chúng tôi vào cuộc cấu trúc lại Silo content, xử lý technical nợ đọng và build mảng Entity authority.
                                    </p>
                                    <ul className="mt-8 space-y-4 text-sm font-medium text-white">
                                        <li className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-[#6dc8be]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                                            Từ 10K lên 52K Traffic/tháng
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-[#6dc8be]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                                            Top 1 từ khóa ngành "Học tiếng Anh online"
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-[#6dc8be]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
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
                                                    <div key={i} className="flex-1 bg-gradient-to-t from-[#6dc8be]/20 to-[#6dc8be] rounded-t-sm transition-all duration-1000 animate-in slide-in-from-bottom-full" style={{ height: `${(h/400)*100}%`, animationDelay: `${i*100}ms` }} />
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
            </div>
        </div>
    )
}
