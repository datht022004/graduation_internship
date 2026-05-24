import { useEffect, useState } from 'react'
import { userGetSeoServiceContent } from '../../../../config/apiService'
import { SEO_SERVICE_TAB_MOCK } from '../../../../mock/pages/user/seo-service-tab.mock'
import RelatedBlogPosts from '../../components/RelatedBlogPosts'

function hasSeoContent(data) {
    return Boolean(data?.metrics?.length || data?.packages?.length || data?.roadmap?.length)
}

export default function SeoServiceTabPage({ onChatClick }) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        async function load() {
            try {
                const result = await userGetSeoServiceContent()
                if (!cancelled) setData(hasSeoContent(result) ? result : SEO_SERVICE_TAB_MOCK)
            } catch (err) {
                console.error('Lỗi tải dữ liệu SEO Service:', err)
                if (!cancelled) setData(SEO_SERVICE_TAB_MOCK)
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
    const packages = data.packages || []
    const roadmap = data.roadmap || []

    return (
        <div className="flex flex-col gap-6 md:gap-10 pb-16">
            <section className="float-in stagger-1 relative mx-3 mt-4 overflow-hidden rounded-[28px] bg-[#09131e] px-4 py-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] sm:mx-4 sm:mt-6 sm:px-6 sm:py-14 md:rounded-[40px] md:py-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(242,104,42,0.15),transparent_40%),radial-gradient(circle_at_85%_0%,rgba(56,189,248,0.12),transparent_40%)]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03]" />
                <div className="relative z-10 mx-auto max-w-310">
                    
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black uppercase tracking-tight text-white drop-shadow-lg md:text-5xl">
                            Giải pháp <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f2682a] to-[#ffb35a]">SEO Toàn Diện</span>
                        </h2>
                        <p className="mt-5 mx-auto max-w-2xl text-base text-slate-300">Tăng trưởng traffic thực chất, thống trị thứ hạng từ khóa và chuyển đổi người dùng thành khách hàng trung thành với tư duy SEO cốt lõi.</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3 mb-16">
                        {metrics.map((metric) => (
                            <article className="group relative rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md transition-transform hover:-translate-y-2 hover:bg-white/10" key={metric.label}>
                                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#f2682a]/20 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
                                <p className="relative text-4xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] sm:text-5xl">{metric.value}</p>
                                <p className="relative mt-3 text-sm font-semibold uppercase tracking-widest text-[#6dc8be]">{metric.label}</p>
                            </article>
                        ))}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3 mb-16">
                        {packages.map((pkg) => (
                            <article className="group flex flex-col justify-between rounded-[24px] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-5 text-white shadow-xl transition hover:border-[#f2682a]/50 hover:bg-white/10 sm:rounded-[32px] sm:p-8" key={pkg.title}>
                                <div>
                                    <h3 className="text-2xl font-bold uppercase tracking-wide text-[#f3c7a3]">{pkg.title}</h3>
                                    <p className="mt-3 text-sm leading-relaxed text-slate-300">{pkg.summary}</p>
                                    <ul className="mt-6 space-y-4 text-sm text-slate-200">
                                        {pkg.points.map((point) => (
                                            <li className="flex items-start gap-4" key={point}>
                                                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#f2682a]/20 text-[#f2682a]">
                                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                                                </span>
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
                        <article className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#13283c] to-[#0a1520] p-6 text-white shadow-2xl sm:rounded-[36px] sm:p-10">
                            <div className="absolute right-0 top-0 h-64 w-64 bg-[#f2682a]/10 blur-[100px]" />
                            <h3 className="text-3xl font-black uppercase text-white relative z-10">Lộ trình triển khai chuẩn quốc tế</h3>
                            <div className="mt-10 space-y-8 relative z-10">
                                {roadmap.map((step, index) => (
                                    <div className="group relative pl-14" key={step}>
                                        {index < roadmap.length - 1 && (
                                            <span className="absolute left-[20px] top-[30px] h-full w-0.5 bg-gradient-to-b from-[#f2682a]/60 to-transparent" />
                                        )}
                                        <span className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-sm font-black text-[#f3c7a3] shadow-lg transition-transform group-hover:scale-110 group-hover:bg-[#f2682a] group-hover:text-white group-hover:border-[#f2682a]">
                                            {index + 1}
                                        </span>
                                        <div className="py-2">
                                            <p className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors">{step}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </article>

                        <article className="relative flex flex-col justify-center overflow-hidden rounded-[28px] bg-[linear-gradient(145deg,#f2682a,#e3521b)] p-6 text-white shadow-[0_30px_60px_rgba(242,104,42,0.35)] sm:rounded-[36px] sm:p-10">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/food.png')] opacity-10 mix-blend-overlay" />
                            <div className="relative z-10">
                                <span className="inline-flex items-center justify-center rounded-2xl bg-white/20 p-4 mb-6 shadow-lg backdrop-blur-md">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                                </span>
                                <h3 className="text-3xl lg:text-4xl font-black uppercase text-white leading-tight">Yêu cầu team Audit Website?</h3>
                                <p className="mt-5 text-base md:text-lg font-medium text-orange-100 leading-relaxed">
                                    Đặt lịch kiểm tra sức khỏe tổng thể cho website của bạn miễn phí ngay hôm nay. Đánh giá chuyên sâu và nhận lộ trình tối ưu cá nhân hóa trong vòng 24H.
                                </p>
                                <button className="mt-10 flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-4 text-sm font-black uppercase text-[#e3521b] transition-transform hover:scale-[1.02] active:scale-95 shadow-xl" onClick={onChatClick} type="button">
                                    <span>Trò chuyện trực tiếp cùng chuyên gia</span>
                                    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                                </button>
                            </div>
                        </article>
                    </div>
                </div>
            </section>
            <RelatedBlogPosts category="Dịch vụ SEO" />
        </div>
    )
}
