import { USER_HEADER_TOP_MENUS_MOCK } from '../../../mock/pages/user/user-header.mock'

export default function UserHeaderTopBar() {
    return (
        <div className="border-y-2 border-[#f2682a] bg-[#f2f2f2]">
            <div className="mx-auto flex w-full max-w-310 flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm text-slate-700">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                    <span>DỊCH VỤ SEO Đà Nẵng</span>
                    <span>0934 52 6656</span>
                    <span>info@seovip.vn</span>
                </div>
                <div className="flex items-center gap-5">
                    <ul className="hidden items-center gap-5 lg:flex">
                        {USER_HEADER_TOP_MENUS_MOCK.map((menu) => (
                            <li className="cursor-pointer hover:text-[#f2682a]" key={menu}>
                                {menu}
                            </li>
                        ))}
                    </ul>
                    <span className="text-xs">Tiếng Việt</span>
                </div>
            </div>
        </div>
    )
}
