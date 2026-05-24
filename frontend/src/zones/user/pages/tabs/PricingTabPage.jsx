import { useEffect, useMemo, useState } from 'react'
import { userGetServicePackages } from '../../../../config/apiService'

function normalizePackages(items = []) {
    return items
        .filter((item) => item?.is_active !== false)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
}

export default function PricingTabPage({ onChatClick }) {
    const [packages, setPackages] = useState([])
    const [activeType, setActiveType] = useState('all')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false

        async function loadPackages() {
            try {
                const result = await userGetServicePackages()
                const nextPackages = normalizePackages(result)
                if (!cancelled) setPackages(nextPackages)
            } catch (err) {
                console.error('Lỗi tải bảng giá dịch vụ:', err)
                if (!cancelled) setPackages([])
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        loadPackages()
        return () => { cancelled = true }
    }, [])

    const serviceTypes = useMemo(() => {
        const types = [...new Set(packages.map((item) => item.service_type).filter(Boolean))]
        return ['all', ...types]
    }, [packages])

    const filteredPackages = activeType === 'all'
        ? packages
        : packages.filter((item) => item.service_type === activeType)

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

    return (
        <div className="flex flex-col gap-8 pb-16">
            <section className="float-in stagger-1 mx-3 mt-4 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_-30px_rgba(15,23,42,0.25)] sm:mx-4 sm:mt-6 md:rounded-[36px]">
                <div className="grid gap-6 border-b border-slate-200 bg-[linear-gradient(135deg,#fff7ef,#f8fbff)] px-4 py-6 sm:px-6 sm:py-8 md:grid-cols-[1fr_auto] md:gap-8 md:px-10">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f2682a]">Bảng giá dịch vụ</p>
                        <h2 className="mt-3 text-2xl font-black uppercase leading-tight text-[#13283c] sm:text-3xl md:text-4xl">
                            Chọn gói phù hợp mục tiêu tăng trưởng
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                            Giá có thể thay đổi theo quy mô website, ngành hàng và mức độ cạnh tranh. Liên hệ để nhận báo giá chi tiết theo dữ liệu thực tế.
                        </p>
                    </div>
                    <button
                        className="self-start rounded-full bg-[#f2682a] px-5 py-3 text-sm font-bold uppercase text-white shadow-lg transition hover:bg-[#e3521b] sm:px-6"
                        onClick={onChatClick}
                        type="button"
                    >
                        Tư vấn gói phù hợp
                    </button>
                </div>

                <div className="px-6 py-5 md:px-10">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {serviceTypes.map((type) => (
                            <button
                                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${activeType === type
                                    ? 'border-[#f2682a] bg-[#fff2ea] text-[#f2682a]'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#f2682a]/40 hover:text-[#f2682a]'
                                    }`}
                                key={type}
                                onClick={() => setActiveType(type)}
                                type="button"
                            >
                                {type === 'all' ? 'Tất cả' : type}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto grid w-full max-w-310 gap-5 px-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredPackages.length === 0 && (
                    <div className="col-span-full rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
                        Chưa có gói dịch vụ nào được bật hiển thị trong hệ thống.
                    </div>
                )}
                {filteredPackages.map((item) => (
                    <article
                        className={`flex flex-col rounded-[24px] border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_22px_50px_-28px_rgba(15,23,42,0.35)] sm:min-h-90 sm:rounded-[28px] sm:p-6 ${item.is_popular ? 'border-[#f2682a] ring-2 ring-[#f2682a]/10' : 'border-slate-200'}`}
                        key={item.id || item.title}
                    >
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                    {item.service_type || 'Dịch vụ'}
                                </span>
                                <h3 className="mt-4 text-2xl font-black uppercase leading-tight text-[#13283c]">{item.title}</h3>
                            </div>
                            {item.is_popular && (
                                <span className="rounded-full bg-[#f2682a] px-3 py-1 text-[11px] font-bold uppercase text-white">
                                    Phổ biến
                                </span>
                            )}
                        </div>

                        <p className="text-sm leading-6 text-slate-600 sm:min-h-18">{item.summary}</p>
                        <p className="mt-6 text-2xl font-black text-[#f2682a]">{item.price_label || 'Liên hệ báo giá'}</p>

                        <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-700">
                            {(item.points || []).map((point) => (
                                <li className="flex items-start gap-3" key={point}>
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                    </span>
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            className="mt-7 rounded-2xl bg-[#13283c] px-5 py-3 text-sm font-bold uppercase text-white transition hover:bg-[#f2682a]"
                            onClick={onChatClick}
                            type="button"
                        >
                            Nhận tư vấn
                        </button>
                    </article>
                ))}
            </section>
        </div>
    )
}
