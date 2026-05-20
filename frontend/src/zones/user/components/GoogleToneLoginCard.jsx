import { GoogleLogin } from '@react-oauth/google'
import { AUTH_ROLES, getRoleLabel } from '../../../helpers/authRoles'
import RoleSelector from './RoleSelector'

const helperContent = {
    [AUTH_ROLES.ADMIN]: 'Dùng tài khoản quản trị để xem báo cáo hệ thống và cấu hình chatbot.',
    [AUTH_ROLES.USER]: 'Dùng tài khoản người dùng để quản lý hội thoại và lịch sử chăm sóc khách hàng.',
}

export default function GoogleToneLoginCard({
    form,
    mode,
    status,
    loading,
    onChangeMode,
    onChangeRole,
    onChangeField,
    onSubmit,
    onGoogleSuccess,
    onClose,
}) {
    const isRegisterMode = mode === 'register'
    const canUseGoogleLogin = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)
        && !isRegisterMode
        && form.role === AUTH_ROLES.USER

    return (
        <div className="login-modal-card relative rounded-[30px] p-5 sm:p-6 md:p-7">
            {onClose && (
                <button
                    aria-label="Đóng đăng nhập"
                    className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#3367D6] active:scale-95"
                    onClick={onClose}
                    type="button"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            )}
            <div className="mb-5 flex items-center gap-3 pr-11">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 shadow-[0_10px_20px_-14px_rgba(15,23,42,0.5)] ring-1 ring-slate-200">
                    <span className="text-lg font-bold text-[#4285F4]">G</span>
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
                        Tài khoản an toàn
                    </p>
                    <h2 className="text-[clamp(1.65rem,5vw,2rem)] leading-none font-black text-slate-900">
                        {isRegisterMode ? 'Tạo tài khoản' : 'Chào mừng trở lại'}
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-2 rounded-2xl border border-blue-100 bg-blue-50/60 p-1">
                <button
                    className={`rounded-xl px-3 py-2 text-sm font-bold transition ${!isRegisterMode
                        ? 'bg-[#4285F4] text-white shadow-[0_12px_24px_-16px_rgba(66,133,244,0.95)]'
                        : 'text-slate-500 hover:bg-white/80 hover:text-[#3367D6]'
                        }`}
                    disabled={loading}
                    onClick={() => onChangeMode('login')}
                    type="button"
                >
                    Đăng nhập
                </button>
                <button
                    className={`rounded-xl px-3 py-2 text-sm font-bold transition ${isRegisterMode
                        ? 'bg-[#4285F4] text-white shadow-[0_12px_24px_-16px_rgba(66,133,244,0.95)]'
                        : 'text-slate-500 hover:bg-white/80 hover:text-[#3367D6]'
                        }`}
                    disabled={loading}
                    onClick={() => onChangeMode('register')}
                    type="button"
                >
                    Đăng ký
                </button>
            </div>

            {!isRegisterMode && <RoleSelector onChange={onChangeRole} value={form.role} />}

            <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                {isRegisterMode
                    ? 'Tạo tài khoản người dùng bằng email và mật khẩu. Tài khoản quản trị chỉ nên được cấp sẵn từ hệ thống.'
                    : helperContent[form.role]}
            </p>

            <form className="mt-4 space-y-3.5" onSubmit={onSubmit}>
                {isRegisterMode && (
                    <label className="block">
                        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Họ tên</span>
                        <input
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                            name="name"
                            onChange={onChangeField}
                            placeholder="Nguyễn Văn A"
                            type="text"
                            value={form.name}
                        />
                    </label>
                )}

                <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-slate-700">Email công việc</span>
                    <input
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                        name="email"
                        onChange={onChangeField}
                        placeholder={form.role === AUTH_ROLES.ADMIN ? 'admin@gmail.com' : 'user@gmail.com'}
                        type="email"
                        value={form.email}
                    />
                </label>

                <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-slate-700">Mật khẩu</span>
                    <input
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                        name="password"
                        onChange={onChangeField}
                        placeholder="123123"
                        type="password"
                        value={form.password}
                    />
                </label>

                <button
                    className="w-full rounded-2xl bg-[#4285F4] px-4 py-2.5 text-sm font-bold text-white shadow-[0_16px_30px_-18px_rgba(66,133,244,0.95)] transition hover:bg-[#3367D6] disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={loading}
                    type="submit"
                >
                    {loading
                        ? 'Đang xác thực...'
                        : isRegisterMode
                            ? 'Tạo tài khoản người dùng'
                            : `Đăng nhập ${getRoleLabel(form.role)}`}
                </button>
            </form>

            {canUseGoogleLogin && (
                <>
                    <div className="relative mt-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-300" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="rounded-full bg-white px-3 text-slate-500 ring-1 ring-slate-200">hoặc</span>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-center">
                        <GoogleLogin
                            onSuccess={onGoogleSuccess}
                            onError={() => { /* handled by parent */ }}
                            text="continue_with"
                            shape="rectangular"
                            width="100%"
                            locale="vi"
                        />
                    </div>
                </>
            )}

            {status && (
                <p
                    className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${status.type === 'success'
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border border-rose-200 bg-rose-50 text-rose-700'
                        }`}
                >
                    {status.message}
                </p>
            )}
        </div>
    )
}
