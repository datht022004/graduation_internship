import { AUTH_ROLES, ROLE_LABELS } from '../../../helpers/authRoles'

export default function RoleSelector({ value, onChange }) {
    const options = [AUTH_ROLES.USER, AUTH_ROLES.ADMIN]

    return (
        <div className="grid grid-cols-2 gap-2 rounded-[22px] bg-slate-100 p-1.5 ring-1 ring-slate-200">
            {options.map((role) => {
                const isActive = value === role
                return (
                    <button
                        className={`rounded-2xl px-3 py-2.5 text-sm font-bold transition ${isActive
                            ? 'bg-white text-slate-900 shadow-[0_8px_18px_rgba(15,23,42,0.12)] ring-1 ring-slate-200'
                            : 'text-slate-500 hover:bg-white/70 hover:text-slate-700'
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
