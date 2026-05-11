export default function UserLandingFooter() {
    return (
        <>
            <footer className="bg-[#14191f] py-12 text-slate-200">
                <div className="mx-auto grid max-w-310 gap-8 px-4 md:grid-cols-3">
                    <section>
                        <p className="text-4xl font-bold uppercase leading-none text-white">SEOvip</p>
                        <p className="mt-2 text-sm text-slate-400">Cùng bạn tỏa sáng</p>
                        <p className="mt-4 text-sm leading-7">
                            Công ty TNHH Truyền Thông SEO VIP
                            <br />
                            0934 52 6656 - info@seovip.vn
                            <br />
                            181 Nguyễn Tri Phương, Đà Nẵng
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold uppercase text-white">Hỗ trợ khách hàng</h3>
                        <ul className="mt-4 space-y-2 text-sm text-slate-300">
                            <li>Chính sách bảo mật thông tin</li>
                            <li>Quy định thanh toán</li>
                            <li>Chính sách bảo hành</li>
                            <li>Bản đồ trang web</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold uppercase text-white">Dịch vụ cung cấp</h3>
                        <ul className="mt-4 space-y-2 text-sm text-slate-300">
                            <li>Dịch vụ SEO tổng thể</li>
                            <li>Thiết kế web chuẩn SEO</li>
                            <li>Quảng cáo Google, Facebook</li>
                            <li>Tư vấn Digital Marketing trọn gói</li>
                        </ul>
                    </section>
                </div>
                <div className="mx-auto mt-8 max-w-310 border-t border-slate-700 px-4 pt-5 text-center text-sm text-slate-400">
                    © 2026 SEO Style Landing. Thiết kế theo phong cách tham chiếu.
                </div>
            </footer>

            <button className="fixed bottom-6 left-3 z-20 rounded-full bg-[#f68a44] px-4 py-2 text-sm font-bold text-white shadow-lg">
                0934 52 6656
            </button>
        </>
    )
}