export function createUserStruct(input = {}) {
    return {
        email: input.email ?? '',
        name: input.name ?? '',
        role: input.role ?? 'user',
    }
}

export function createAuthSessionStruct(input = {}) {
    return {
        accessToken: input.access_token ?? input.accessToken ?? '',
        user: createUserStruct(input.user),
    }
}
