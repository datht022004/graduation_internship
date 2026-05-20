import { AUTH_ROLES, ROLE_LABELS } from '../../../helpers/authRoles'

export default function RoleSelector({ value, onChange }) {
    const options = [AUTH_ROLES.USER, AUTH_ROLES.ADMIN]

    return (
        <div className="grid grid-cols-2 gap-2 rounded-[22px] bg-blue-50/60 p-1.5 ring-1 ring-blue-100">
            {options.map((role) => {
                const isActive = value === role
                return (
                    <button
                        className={`rounded-2xl px-3 py-2.5 text-sm font-bold transition ${isActive
                            ? 'bg-[#4285F4] text-white shadow-[0_12px_24px_-16px_rgba(66,133,244,0.95)]'
                            : 'text-slate-500 hover:bg-white/80 hover:text-[#3367D6]'
                            }`}
                        key={role}
                        onClick={() => onChange(role)}
                        type="button"
                    >
                        {ROLE_LABELS[role]}
                    </button>
                )
            })}
        </div>
    )
}
