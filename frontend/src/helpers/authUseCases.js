export async function loginWithEmailPassword(authGateway, payload) {
    if (!payload.email || !payload.password) {
        throw new Error('Vui lòng nhập đầy đủ email và mật khẩu.')
    }

    const normalizedPayload = {
        ...payload,
        email: payload.email.trim().toLowerCase(),
    }

    return authGateway.login(normalizedPayload)
}

export async function registerWithEmailPassword(authGateway, payload) {
    if (!payload.name || !payload.email || !payload.password) {
        throw new Error('Vui lòng nhập đầy đủ họ tên, email và mật khẩu.')
    }

    if (payload.password.length < 6) {
        throw new Error('Mật khẩu cần có ít nhất 6 ký tự.')
    }

    const normalizedPayload = {
        ...payload,
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
    }

    return authGateway.register(normalizedPayload)
}
