import { USER_HEADER_TOP_MENUS_MOCK } from '../../../mock/pages/user/user-header.mock'

export default function UserHeaderTopBar() {
    return (
        <div className="border-y-2 border-[#f2682a] bg-[#f2f2f2]">
            <div className="mx-auto flex w-full max-w-310 flex-wrap items-center justify-center gap-2 px-4 py-2 text-xs text-slate-700 sm:justify-between sm:text-sm">
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-start sm:gap-x-5">
                    <span>DỊCH VỤ SEO Đà Nẵng</span>
                    <span>0356031160</span>
                    <span>datht.022004@gmail.com</span>
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
