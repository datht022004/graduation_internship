export default function UserHeroBanner({ tab, onChatClick }) {
    return (
        <section className="relative overflow-hidden bg-[#0e1e2d]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,80,130,0.45),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(242,104,42,0.33),transparent_35%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(13,29,45,0.92),rgba(242,104,42,0.58))]" />
            <div className="relative mx-auto max-w-310 px-4 py-16 text-center text-white md:py-24">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ffd6b5]">{tab.eyebrow}</p>
                <h1 className="mt-3 text-3xl font-semibold uppercase md:text-5xl">{tab.title}</h1>
                <p className="mx-auto mt-5 max-w-5xl text-base leading-relaxed text-slate-100 md:text-2xl">
                    {tab.description}
                </p>
                <p className="mx-auto mt-3 max-w-4xl text-sm text-slate-200 md:text-xl">
                    Cam kết dịch vụ chất lượng, minh bạch và đồng hành dài hạn cùng doanh nghiệp Việt.
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                    <button
                        className="rounded-full bg-[#f68a44] px-6 py-3 text-sm font-bold uppercase text-white transition hover:bg-[#e36d22]"
                        onClick={onChatClick}
                        type="button"
                    >
                        Chat tư vấn ngay
                    </button>
                    <button className="rounded-full border border-white/60 px-6 py-3 text-sm font-bold uppercase text-white transition hover:bg-white/10">
                        Hồ sơ năng lực
                    </button>
                </div>
            </div>
        </section>
    )
}
