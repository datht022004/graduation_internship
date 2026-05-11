export const AUTH_ROLES = {
    ADMIN: 'admin',
    USER: 'user',
}

export const ROLE_LABELS = {
    [AUTH_ROLES.ADMIN]: 'Quản trị viên',
    [AUTH_ROLES.USER]: 'Người dùng',
}

export function getRoleLabel(role) {
    return ROLE_LABELS[role] ?? 'Người dùng'
}