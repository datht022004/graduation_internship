const API_PROTOCOL = import.meta.env.VITE_API_PROTOCOL || 'http'
const API_HOST = import.meta.env.VITE_API_HOST || window.location.hostname || 'localhost'
const API_PORT = import.meta.env.VITE_API_PORT || '8000'

export const API_URL = (
    import.meta.env.VITE_API_BASE_URL
    || `${API_PROTOCOL}://${API_HOST}:${API_PORT}/api`
).replace(/\/$/, '')

export const API_ENDPOINTS = {
    auth: {
        register: `${API_URL}/auth/register`,
        login: `${API_URL}/auth/login`,
        google: `${API_URL}/auth/google`,
        me: `${API_URL}/auth/me`,
    },
    user: {
        home: `${API_URL}/user/home`,
        seoService: `${API_URL}/user/seo-service`,
        webDesign: `${API_URL}/user/web-design`,
        ads: `${API_URL}/user/ads`,
        blog: `${API_URL}/user/blog`,
    },
    chat: {
        stream: `${API_URL}/chat`,
        sessions: `${API_URL}/chat/sessions`,
        sessionById: (id) => `${API_URL}/chat/sessions/${id}`,
    },
    documents: {
        list: `${API_URL}/documents`,
        upload: `${API_URL}/documents/upload`,
        byId: (id) => `${API_URL}/documents/${id}`,
    },
    admin: {
        blogPosts: `${API_URL}/admin/blog/posts`,
        blogPostById: (id) => `${API_URL}/admin/blog/posts/${id}`,
        blogPostToggleFeatured: (id) => `${API_URL}/admin/blog/posts/${id}/toggle-featured`,
        users: `${API_URL}/admin/users`,
        userByEmail: (email) => `${API_URL}/admin/users/${encodeURIComponent(email)}`,
        categories: `${API_URL}/admin/categories`,
        categoryById: (id) => `${API_URL}/admin/categories/${id}`,
    },
}
