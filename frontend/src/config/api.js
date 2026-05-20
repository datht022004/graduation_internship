import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const API_ENDPOINTS = {
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        google: '/auth/google',
        me: '/auth/me',
    },
    chat: {
        stream: '/chat',
        sessions: '/chat/sessions',
        sessionById: (id) => `/chat/sessions/${id}`,
    },
    documents: {
        list: '/documents',
        upload: '/documents/upload',
        byId: (id) => `/documents/${id}`,
    },
    user: {
        home: '/user/home',
        seoService: '/user/seo-service',
        webDesign: '/user/web-design',
        ads: '/user/ads',
        blog: '/user/blog',
    },
    admin: {
        blogPosts: '/admin/blog/posts',
        blogPostById: (id) => `/admin/blog/posts/${id}`,
        blogPostToggleFeatured: (id) => `/admin/blog/posts/${id}/toggle-featured`,
        users: '/admin/users',
        userByEmail: (email) => `/admin/users/${encodeURIComponent(email)}`,
        categories: '/admin/categories',
        categoryById: (id) => `/admin/categories/${id}`,
    },
}

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
})

export default apiClient

export function getStoredAuthSession() {
    const storedSession = localStorage.getItem('app_auth_session')

    if (!storedSession) {
        return null
    }

    try {
        return JSON.parse(storedSession)
    } catch (error) {
        console.warn('Khong the doc app_auth_session tu localStorage.', error)
        return null
    }
}

export function getAuthToken() {
    return getStoredAuthSession()?.token ?? null
}

export function getAuthHeaders(headers = {}) {
    const token = getAuthToken()

    if (!token || headers.Authorization) {
        return headers
    }

    return {
        ...headers,
        Authorization: `Bearer ${token}`,
    }
}

export function buildApiUrl(path) {
    if (/^https?:\/\//.test(path)) {
        return path
    }

    const base = API_BASE_URL.replace(/\/$/, '')
    const endpoint = path.startsWith('/') ? path : `/${path}`
    return `${base}${endpoint}`
}

apiClient.interceptors.request.use((config) => {
    const token = getAuthToken()

    if (token && !config.headers?.Authorization) {
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
        }
    }

    return config
})

function createUserStruct(input = {}) {
    return {
        email: input.email ?? '',
        name: input.name ?? '',
        role: input.role ?? 'user',
    }
}

function createAuthSessionStruct(input = {}) {
    return {
        accessToken: input.access_token ?? input.accessToken ?? '',
        user: createUserStruct(input.user),
    }
}

function createDocumentStruct(input = {}) {
    return {
        id: input.id ?? '',
        filename: input.filename ?? '',
        file_type: input.file_type ?? '',
        file_size: input.file_size ?? 0,
        chunk_count: input.chunk_count ?? 0,
        uploaded_at: input.uploaded_at ?? '',
    }
}

function normalizePageResponse(data, params = {}) {
    if (Array.isArray(data)) {
        return {
            items: data,
            total: data.length,
            page: 1,
            pageSize: data.length || params.pageSize || 10,
            totalPages: 1,
        }
    }

    return data
}

async function getData(path, config) {
    const { data } = await apiClient.get(path, config)
    return data
}

async function postData(path, payload, config) {
    const { data } = await apiClient.post(path, payload, config)
    return data
}

async function putData(path, payload) {
    const { data } = await apiClient.put(path, payload)
    return data
}

async function patchData(path, payload) {
    const { data } = await apiClient.patch(path, payload)
    return data
}

async function deleteData(path) {
    await apiClient.delete(path)
}

async function postAuth(path, payload) {
    try {
        const data = await postData(path, payload)
        return createAuthSessionStruct(data)
    } catch (error) {
        const message = error.response?.data?.detail || error.message || 'Xác thực thất bại.'
        throw new Error(message)
    }
}

export const authApi = {
    login({ email, password, role }) {
        return postAuth(API_ENDPOINTS.auth.login, { email, password, role })
    },

    register({ name, email, password }) {
        return postAuth(API_ENDPOINTS.auth.register, { name, email, password })
    },

    googleLogin({ google_token, role }) {
        return postAuth(API_ENDPOINTS.auth.google, { google_token, role })
    },
}

export function getUserHome() {
    return getData(API_ENDPOINTS.user.home)
}

export function getUserSeoService() {
    return getData(API_ENDPOINTS.user.seoService)
}

export function getUserWebDesign() {
    return getData(API_ENDPOINTS.user.webDesign)
}

export function getUserAds() {
    return getData(API_ENDPOINTS.user.ads)
}

export function getUserBlog() {
    return getData(API_ENDPOINTS.user.blog)
}

export async function getAdminDocumentPage(params = {}) {
    const data = await getData(API_ENDPOINTS.documents.list, { params })
    const documents = (data.documents || []).map(createDocumentStruct)

    return {
        documents,
        total: data.total ?? documents.length,
        page: data.page ?? 1,
        pageSize: data.pageSize ?? (documents.length || params.pageSize || 10),
        totalPages: data.totalPages ?? 1,
    }
}

export async function getAdminDocuments(params = {}) {
    const data = await getAdminDocumentPage(params)
    return data.documents
}

export async function uploadAdminDocument(file) {
    const formData = new FormData()
    formData.append('file', file)
    const data = await postData(API_ENDPOINTS.documents.upload, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
    })
    return createDocumentStruct(data.document)
}

export function deleteAdminDocument(docId) {
    return deleteData(API_ENDPOINTS.documents.byId(docId))
}

export async function getBlogPostPage(params = {}) {
    const data = await getData(API_ENDPOINTS.admin.blogPosts, { params })
    return normalizePageResponse(data, params)
}

export async function getBlogPosts(params = {}) {
    const data = await getBlogPostPage({ pageSize: 100, ...params })
    return data.items || []
}

export function createBlogPost(payload) {
    return postData(API_ENDPOINTS.admin.blogPosts, payload)
}

export function updateBlogPost(id, payload) {
    return putData(API_ENDPOINTS.admin.blogPostById(id), payload)
}

export function deleteBlogPost(id) {
    return deleteData(API_ENDPOINTS.admin.blogPostById(id))
}

export function toggleFeaturedPost(id) {
    return patchData(API_ENDPOINTS.admin.blogPostToggleFeatured(id))
}

export async function getUserPage(params = {}) {
    const data = await getData(API_ENDPOINTS.admin.users, { params })
    return normalizePageResponse(data, params)
}

export function createManagedUser(payload) {
    return postData(API_ENDPOINTS.admin.users, payload)
}

export function updateManagedUser(email, payload) {
    return putData(API_ENDPOINTS.admin.userByEmail(email), payload)
}

export function deleteManagedUser(email) {
    return deleteData(API_ENDPOINTS.admin.userByEmail(email))
}

export async function getCategoryPage(params = {}) {
    const data = await getData(API_ENDPOINTS.admin.categories, { params })
    return normalizePageResponse(data, params)
}

export async function getCategories(params = {}) {
    const data = await getCategoryPage(params)
    return data.items || []
}

export function createCategory(payload) {
    return postData(API_ENDPOINTS.admin.categories, payload)
}

export function updateCategory(id, payload) {
    return putData(API_ENDPOINTS.admin.categoryById(id), payload)
}

export function deleteCategory(id) {
    return deleteData(API_ENDPOINTS.admin.categoryById(id))
}

function parseSources(value) {
    try {
        return JSON.parse(value)
    } catch {
        return []
    }
}

export async function streamChatMessage({
    message,
    sessionId,
    signal,
    onTextChange,
    onSessionChange,
}) {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.chat.stream), {
        method: 'POST',
        headers: getAuthHeaders({
            'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
            message,
            session_id: sessionId,
        }),
        signal,
    })

    if (!response.ok) {
        throw new Error(response.status === 401 ? 'Phiên đăng nhập hết hạn' : `Lỗi server: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullText = ''
    let sources = []
    let buffer = ''
    let nextIsSessionId = false
    let nextIsSources = false
    let activeSessionId = sessionId

    while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
            if (line.startsWith('event: session')) {
                nextIsSessionId = true
                continue
            }

            if (line.startsWith('event: sources')) {
                nextIsSources = true
                continue
            }

            if (line.startsWith('event: done') || !line.startsWith('data: ')) {
                continue
            }

            const payload = line.slice(6)

            if (!payload || payload === '[DONE]') {
                continue
            }

            if (nextIsSessionId) {
                nextIsSessionId = false
                activeSessionId = payload
                onSessionChange?.(payload)
                continue
            }

            if (nextIsSources) {
                nextIsSources = false
                sources = parseSources(payload)
                continue
            }

            fullText += payload
            onTextChange?.(fullText)
        }
    }

    return {
        text: fullText || 'Xin lỗi, tôi không thể trả lời lúc này.',
        sources,
        sessionId: activeSessionId,
    }
}

export async function getChatSessions() {
    const data = await getData(API_ENDPOINTS.chat.sessions)
    return data.sessions || []
}

export function getChatSession(sessionId) {
    return getData(API_ENDPOINTS.chat.sessionById(sessionId))
}
