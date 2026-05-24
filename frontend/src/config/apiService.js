import axios from 'axios'

axios.defaults.timeout = 10000

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
        siteContent: `${API_URL}/admin/site-content`,
        siteContentById: (id) => `${API_URL}/admin/site-content/${id}`,
        companyProfile: `${API_URL}/admin/company-profile`,
        companyProfileById: (id) => `${API_URL}/admin/company-profile/${id}`,
        servicePackages: `${API_URL}/admin/service-packages`,
        servicePackageById: (id) => `${API_URL}/admin/service-packages/${id}`,
        caseStudies: `${API_URL}/admin/case-studies`,
        caseStudyById: (id) => `${API_URL}/admin/case-studies/${id}`,
        testimonials: `${API_URL}/admin/testimonials`,
        testimonialById: (id) => `${API_URL}/admin/testimonials/${id}`,
        contactRequests: `${API_URL}/admin/contact-requests`,
        contactRequestById: (id) => `${API_URL}/admin/contact-requests/${id}`,
    },
}

function getAuthToken() {
    try {
        return JSON.parse(localStorage.getItem('app_auth_session'))?.token || null
    } catch {
        return null
    }
}

function withAuthHeaders(headers = {}) {
    const token = getAuthToken()

    if (!token || headers.Authorization) {
        return headers
    }

    return {
        ...headers,
        Authorization: `Bearer ${token}`,
    }
}

axios.interceptors.request.use((config) => ({
    ...config,
    headers: withAuthHeaders(config.headers),
}))

// POST /auth/login - Auth module: đăng nhập email/password.
export async function authLogin(payload) {
    const { data } = await axios.post(API_ENDPOINTS.auth.login, payload)
    return data
}

// POST /auth/register - Auth module: đăng ký tài khoản user.
export async function authRegister(payload) {
    const { data } = await axios.post(API_ENDPOINTS.auth.register, payload)
    return data
}

// POST /auth/google - Auth module: đăng nhập bằng Google token.
export async function authLoginWithGoogle(payload) {
    const { data } = await axios.post(API_ENDPOINTS.auth.google, payload)
    return data
}

// GET /auth/me - Auth module: lấy thông tin user hiện tại.
export async function authGetCurrentUser() {
    const { data } = await axios.get(API_ENDPOINTS.auth.me)
    return data
}

export const authApi = {
    login: authLogin,
    register: authRegister,
    googleLogin: authLoginWithGoogle,
    me: authGetCurrentUser,
}

// GET /user/home - User module: lấy nội dung trang Home.
export async function userGetHomeContent() {
    try {
        const { data } = await axios.get(`${API_URL}/user/site-content/home`)
        if (Array.isArray(data) && data.length > 0) {
            const transformed = {}
            for (const item of data) {
                if (item.section_key === 'services') transformed.serviceCards = item.content?.serviceCards || []
                if (item.section_key === 'pain_points') transformed.painPoints = item.content?.items || []
                if (item.section_key === 'strengths') transformed.strengths = item.content?.items || []
            }
            return transformed
        }
    } catch (err) {
        console.warn('Could not fetch home content from CMS', err)
    }
    // Fallback
    const { data } = await axios.get(API_ENDPOINTS.user.home).catch(() => ({ data: null }))
    return data
}

// GET /user/seo-service - User module: lấy nội dung dịch vụ SEO.
export async function userGetSeoServiceContent() {
    try {
        const { data } = await axios.get(`${API_URL}/user/site-content/seo-service`)
        if (Array.isArray(data) && data.length > 0) {
            const transformed = {}
            for (const item of data) {
                if (item.section_key === 'metrics') transformed.metrics = item.content?.items || []
                if (item.section_key === 'packages') transformed.packages = item.content?.items || []
                if (item.section_key === 'roadmap') transformed.roadmap = item.content?.items || []
            }
            return transformed
        }
    } catch (err) { console.warn('Could not fetch seo-service content', err) }
    const { data } = await axios.get(API_ENDPOINTS.user.seoService).catch(() => ({ data: null }))
    return data
}

// GET /user/web-design - User module: lấy nội dung thiết kế website.
export async function userGetWebDesignContent() {
    try {
        const { data } = await axios.get(`${API_URL}/user/site-content/web-design`)
        if (Array.isArray(data) && data.length > 0) {
            const transformed = {}
            for (const item of data) {
                if (item.section_key === 'phases') transformed.phases = item.content?.items || []
                if (item.section_key === 'highlights') transformed.highlights = item.content?.items || []
            }
            return transformed
        }
    } catch (err) { console.warn('Could not fetch web-design content', err) }
    const { data } = await axios.get(API_ENDPOINTS.user.webDesign).catch(() => ({ data: null }))
    return data
}

// GET /user/ads - User module: lấy nội dung quảng cáo.
export async function userGetAdsContent() {
    try {
        const { data } = await axios.get(`${API_URL}/user/site-content/ads`)
        if (Array.isArray(data) && data.length > 0) {
            const transformed = {}
            for (const item of data) {
                if (item.section_key === 'channels') transformed.channels = item.content?.items || []
                if (item.section_key === 'metrics') transformed.metrics = item.content?.items || []
            }
            return transformed
        }
    } catch (err) { console.warn('Could not fetch ads content', err) }
    const { data } = await axios.get(API_ENDPOINTS.user.ads).catch(() => ({ data: null }))
    return data
}

// GET /user/blog - User module: lấy dữ liệu blog public.
export async function userGetBlogContent() {
    const { data } = await axios.get(API_ENDPOINTS.user.blog)
    return data
}

// GET /documents - Document module: lấy danh sách tài liệu admin.
export async function documentGetAdminPage(params = {}) {
    const { data } = await axios.get(API_ENDPOINTS.documents.list, { params })
    return data
}

// GET /documents - Document module: lấy mảng tài liệu admin.
export const documentGetAdminList = async (params = {}) => (await documentGetAdminPage(params)).documents || []

// POST /documents/upload - Document module: upload và index tài liệu RAG.
export async function documentUploadAdminFile(file) {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await axios.post(API_ENDPOINTS.documents.upload, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
    })
    return data
}

// DELETE /documents/{id} - Document module: xóa tài liệu RAG.
export async function documentDeleteById(docId) {
    const { data } = await axios.delete(API_ENDPOINTS.documents.byId(docId))
    return data
}

// GET /admin/blog/posts - Admin blog module: lấy danh sách bài viết có phân trang.
export async function adminBlogGetPostPage(params = {}) {
    const { data } = await axios.get(API_ENDPOINTS.admin.blogPosts, { params })
    return data
}

// GET /admin/blog/posts - Admin blog module: lấy mảng bài viết.
export const adminBlogGetPosts = async (params = {}) => (await adminBlogGetPostPage({ pageSize: 100, ...params })).items || []

// POST /admin/blog/posts - Admin blog module: tạo bài viết.
export async function adminBlogCreatePost(payload) {
    const { data } = await axios.post(API_ENDPOINTS.admin.blogPosts, payload)
    return data
}

// PUT /admin/blog/posts/{id} - Admin blog module: cập nhật bài viết.
export async function adminBlogUpdatePost(id, payload) {
    const { data } = await axios.put(API_ENDPOINTS.admin.blogPostById(id), payload)
    return data
}

// DELETE /admin/blog/posts/{id} - Admin blog module: xóa bài viết.
export async function adminBlogDeletePost(id) {
    const { data } = await axios.delete(API_ENDPOINTS.admin.blogPostById(id))
    return data
}

// PATCH /admin/blog/posts/{id}/toggle-featured - Admin blog module: bật/tắt nổi bật.
export async function adminBlogToggleFeaturedPost(id) {
    const { data } = await axios.patch(API_ENDPOINTS.admin.blogPostToggleFeatured(id))
    return data
}

// GET /admin/users - Admin user module: lấy danh sách user có phân trang.
export async function adminUserGetPage(params = {}) {
    const { data } = await axios.get(API_ENDPOINTS.admin.users, { params })
    return data
}

// POST /admin/users - Admin user module: tạo user.
export async function adminUserCreate(payload) {
    const { data } = await axios.post(API_ENDPOINTS.admin.users, payload)
    return data
}

// PUT /admin/users/{email} - Admin user module: cập nhật user.
export async function adminUserUpdateByEmail(email, payload) {
    const { data } = await axios.put(API_ENDPOINTS.admin.userByEmail(email), payload)
    return data
}

// DELETE /admin/users/{email} - Admin user module: xóa user.
export async function adminUserDeleteByEmail(email) {
    const { data } = await axios.delete(API_ENDPOINTS.admin.userByEmail(email))
    return data
}

// GET /admin/categories - Admin category module: lấy danh mục có phân trang.
export async function adminCategoryGetPage(params = {}) {
    const { data } = await axios.get(API_ENDPOINTS.admin.categories, { params })
    return data
}

// GET /admin/categories - Admin category module: lấy mảng danh mục.
export const adminCategoryGetList = async (params = {}) => (await adminCategoryGetPage(params)).items || []

// POST /admin/categories - Admin category module: tạo danh mục.
export async function adminCategoryCreate(payload) {
    const { data } = await axios.post(API_ENDPOINTS.admin.categories, payload)
    return data
}

// PUT /admin/categories/{id} - Admin category module: cập nhật danh mục.
export async function adminCategoryUpdateById(id, payload) {
    const { data } = await axios.put(API_ENDPOINTS.admin.categoryById(id), payload)
    return data
}

// DELETE /admin/categories/{id} - Admin category module: xóa danh mục.
export async function adminCategoryDeleteById(id) {
    const { data } = await axios.delete(API_ENDPOINTS.admin.categoryById(id))
    return data
}

// GET /admin/site-content - Lấy nội dung trang.
export async function adminSiteContentGetByPage(pageKey) {
    const { data } = await axios.get(API_ENDPOINTS.admin.siteContent, { params: { page_key: pageKey } })
    return data || []
}

// PUT /admin/site-content/{id} - Cập nhật nội dung CMS.
export async function adminSiteContentUpdateById(id, payload) {
    const { data } = await axios.put(API_ENDPOINTS.admin.siteContentById(id), payload)
    return data
}

// POST /chat - Chat module: gửi message và nhận SSE stream.
export function chatStreamMessage({ message, sessionId, signal }) {
    return fetch(API_ENDPOINTS.chat.stream, {
        method: 'POST',
        headers: withAuthHeaders({
            'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
            message,
            session_id: sessionId,
        }),
        signal,
    })
}

// GET /chat/sessions - Chat module: lấy danh sách session chat.
export async function chatGetSessions() {
    const { data } = await axios.get(API_ENDPOINTS.chat.sessions)
    return data.sessions || []
}

// GET /chat/sessions/{id} - Chat module: lấy chi tiết một session chat.
export async function chatGetSessionById(sessionId) {
    const { data } = await axios.get(API_ENDPOINTS.chat.sessionById(sessionId))
    return data
}

// CMS Admin: Company Profile
export async function adminCompanyProfileGetList() {
    const { data } = await axios.get(API_ENDPOINTS.admin.companyProfile)
    return data
}
export async function adminCompanyProfileCreate(payload) {
    const { data } = await axios.post(API_ENDPOINTS.admin.companyProfile, payload)
    return data
}
export async function adminCompanyProfileUpdateById(id, payload) {
    const { data } = await axios.put(API_ENDPOINTS.admin.companyProfileById(id), payload)
    return data
}
export async function adminCompanyProfileDeleteById(id) {
    const { data } = await axios.delete(API_ENDPOINTS.admin.companyProfileById(id))
    return data
}

// CMS Admin: Service Packages
export async function adminServicePackagesGetList() {
    const { data } = await axios.get(API_ENDPOINTS.admin.servicePackages)
    return data
}
export async function adminServicePackagesCreate(payload) {
    const { data } = await axios.post(API_ENDPOINTS.admin.servicePackages, payload)
    return data
}
export async function adminServicePackagesUpdateById(id, payload) {
    const { data } = await axios.put(API_ENDPOINTS.admin.servicePackageById(id), payload)
    return data
}
export async function adminServicePackagesDeleteById(id) {
    const { data } = await axios.delete(API_ENDPOINTS.admin.servicePackageById(id))
    return data
}

// CMS Admin: Case Studies
export async function adminCaseStudiesGetList() {
    const { data } = await axios.get(API_ENDPOINTS.admin.caseStudies)
    return data
}
export async function adminCaseStudiesCreate(payload) {
    const { data } = await axios.post(API_ENDPOINTS.admin.caseStudies, payload)
    return data
}
export async function adminCaseStudiesUpdateById(id, payload) {
    const { data } = await axios.put(API_ENDPOINTS.admin.caseStudyById(id), payload)
    return data
}
export async function adminCaseStudiesDeleteById(id) {
    const { data } = await axios.delete(API_ENDPOINTS.admin.caseStudyById(id))
    return data
}

// ----------------------------------------------------------------------
// ADMIN: TESTIMONIALS (CMS)
// ----------------------------------------------------------------------

export async function adminTestimonialsGetList() {
    const { data } = await axios.get(API_ENDPOINTS.admin.testimonials)
    return data
}

export async function adminTestimonialsCreate(payload) {
    const { data } = await axios.post(API_ENDPOINTS.admin.testimonials, payload)
    return data
}

export async function adminTestimonialsUpdateById(id, payload) {
    const { data } = await axios.put(API_ENDPOINTS.admin.testimonialById(id), payload)
    return data
}

export async function adminTestimonialsDeleteById(id) {
    const { data } = await axios.delete(API_ENDPOINTS.admin.testimonialById(id))
    return data
}

// ----------------------------------------------------------------------
// ADMIN: CHAT HISTORY (Replaces Contact Requests purpose)
// ----------------------------------------------------------------------

export const adminChatGetUsers = async () => {
    const { data } = await axios.get(`${API_URL}/admin/chat/users`)
    return data
}

export const adminChatGetUserSessions = async (email) => {
    const { data } = await axios.get(`${API_URL}/admin/chat/users/${encodeURIComponent(email)}/sessions`)
    return data
}

export const adminChatGetSessionDetail = async (sessionId) => {
    const { data } = await axios.get(`${API_URL}/admin/chat/sessions/${sessionId}`)
    return data
}

// CMS Admin: Contact Requests
export async function adminContactRequestsGetList() {
    const { data } = await axios.get(API_ENDPOINTS.admin.contactRequests)
    return data
}
export async function adminContactRequestsCreate(payload) {
    const { data } = await axios.post(API_ENDPOINTS.admin.contactRequests, payload)
    return data
}
export async function adminContactRequestsUpdateById(id, payload) {
    const { data } = await axios.put(API_ENDPOINTS.admin.contactRequestById(id), payload)
    return data
}
export async function adminContactRequestsDeleteById(id) {
    const { data } = await axios.delete(API_ENDPOINTS.admin.contactRequestById(id))
    return data
}
