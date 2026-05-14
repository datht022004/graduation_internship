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
        categories: '/admin/categories',
        categoryById: (id) => `/admin/categories/${id}`,
        homeServiceCards: '/admin/home/service-cards',
        homeServiceCardById: (id) => `/admin/home/service-cards/${id}`,
        homePainPoints: '/admin/home/pain-points',
        homePainPointById: (id) => `/admin/home/pain-points/${id}`,
        homeStrengths: '/admin/home/strengths',
        homeStrengthById: (id) => `/admin/home/strengths/${id}`,
        seoServiceMetrics: '/admin/seo-service/metrics',
        seoServiceMetricById: (id) => `/admin/seo-service/metrics/${id}`,
        seoServicePackages: '/admin/seo-service/packages',
        seoServicePackageById: (id) => `/admin/seo-service/packages/${id}`,
        seoServiceRoadmap: '/admin/seo-service/roadmap',
        seoServiceRoadmapById: (id) => `/admin/seo-service/roadmap/${id}`,
        webDesignPhases: '/admin/web-design/phases',
        webDesignPhaseById: (id) => `/admin/web-design/phases/${id}`,
        webDesignHighlights: '/admin/web-design/highlights',
        webDesignHighlightById: (id) => `/admin/web-design/highlights/${id}`,
        adsMetrics: '/admin/ads/metrics',
        adsMetricById: (id) => `/admin/ads/metrics/${id}`,
        adsChannels: '/admin/ads/channels',
        adsChannelById: (id) => `/admin/ads/channels/${id}`,
    },
}

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

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
})

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

export default apiClient

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

async function postAuth(path, payload) {
    try {
        const { data } = await apiClient.post(path, payload)
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

export async function getUserLandingContent() {
    return {
        messages: {
            loginRequired: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để bắt đầu chat tư vấn.',
            loginHint: 'Vui lòng đăng nhập để sử dụng đầy đủ tính năng.',
            chatGreeting: (name) => `Xin chào ${name}, trợ lý AI đang sẵn sàng hỗ trợ bạn.`,
            loginSuccess: (name) => `Đăng nhập thành công. Chào ${name}, bạn có thể chat ngay bây giờ.`,
        },
        labels: {
            adminButton: 'Quản lý tài liệu',
            chatButton: 'Chat ngay',
            closeButton: 'Đóng',
        },
    }
}

export async function getUserHome() {
    return {
        serviceCards: [
            { title: 'Dịch vụ SEO tổng thể', desc: 'Lộ trình SEO rõ ràng: tư vấn, phân tích, triển khai và đo lường để tăng đơn bền vững.' },
            { title: 'Thiết kế website', desc: 'Website chuẩn SEO, tối ưu tốc độ, tập trung trải nghiệm UX/UI cho khách hàng doanh nghiệp.' },
            { title: 'Báo điện tử - PR', desc: 'Gia tăng nhận diện thương hiệu thông qua hệ thống báo chí và mạng lưới đối tác đa ngành.' },
            { title: 'Quảng cáo đa kênh', desc: 'Google Ads, Facebook Ads, TikTok Ads theo chiến lược chuyển đổi và kiểm soát ngân sách.' },
            { title: 'SEO chuyển đổi CRO', desc: 'Tối ưu hành trình khách hàng để tăng tỉ lệ chốt đơn và giảm chi phí trên mỗi lead.' },
        ],
        painPoints: [
            'Tốn tiền chạy quảng cáo nhưng lượng khách không ổn định.',
            'Website có traffic nhưng tỉ lệ chuyển đổi thấp.',
            'Không đo được hiệu quả từng kênh Digital Marketing.',
            'Nội dung rời rạc, khó xây thương hiệu dài hạn.',
        ],
        strengths: [
            'Thực chiến hơn 250 dự án đa lĩnh vực.',
            'Cam kết KPI theo từng giai đoạn triển khai.',
            'Hệ thống tư vấn và chăm sóc khách hàng 24/7.',
            'Tối ưu chi phí nhưng vẫn đảm bảo tăng trưởng bền vững.',
        ],
    }
}

export async function getUserSeoService() {
    return {
        metrics: [
            { value: '+168%', label: 'Organic traffic sau 6 tháng' },
            { value: '4.2x', label: 'Tăng lead từ kênh tìm kiếm' },
            { value: '91%', label: 'Keyword ưu tiên vào top 10' },
        ],
        packages: [
            { title: 'SEO Local', summary: 'Phù hợp doanh nghiệp cần tăng khách hàng tại địa phương, tối ưu Google Business Profile.', points: ['Tối ưu map và local landing', 'Kế hoạch review thật theo ngành', 'Báo cáo cuộc gọi/đặt lịch'] },
            { title: 'SEO Tổng Thể', summary: 'Kết hợp technical, content, internal link và entity để phát triển bền vững toàn website.', points: ['Audit 70+ tiêu chí kỹ thuật', 'Roadmap content theo funnel', 'Tối ưu chuyển đổi trên trang đích'] },
            { title: 'SEO E-commerce', summary: 'Tối ưu cấu trúc danh mục, sản phẩm và schema để tăng doanh thu từ tìm kiếm tự nhiên.', points: ['Chiến lược danh mục chủ lực', 'Mẫu product page chuẩn intent', 'Tracking doanh thu theo cụm từ khóa'] },
        ],
        roadmap: [
            'Tuần 1-2: Audit & KPI',
            'Tuần 3-6: Khắc phục kỹ thuật',
            'Tháng 2-3: Content + Internal Link',
            'Tháng 4+: Mở rộng cụm chủ đề + CRO',
        ],
    }
}

export async function getUserWebDesign() {
    return {
        phases: [
            { title: 'Discovery', desc: 'Phân tích người dùng, hành vi và mục tiêu kinh doanh.' },
            { title: 'UX/UI System', desc: 'Thiết kế wireframe và giao diện nhất quán theo brand.' },
            { title: 'Build & SEO', desc: 'Phát triển giao diện, tối ưu tốc độ và setup SEO căn bản.' },
            { title: 'Launch', desc: 'QA đa thiết bị, go-live và theo dõi hiệu suất 30 ngày.' },
        ],
        highlights: [
            'Tối ưu Core Web Vitals từ đầu',
            'Cấu trúc thông tin để tìm kiếm hiểu đúng',
            'Mẫu trang đích để chốt lead nhanh hơn',
        ],
    }
}

export async function getUserAds() {
    return {
        metrics: [
            { value: '-28%', label: 'Giảm CPL sau tối ưu' },
            { value: '3.6x', label: 'ROAS trung bình campaign chủ lực' },
            { value: '72h', label: 'Chu kỳ tối ưu creative' },
        ],
        channels: [
            { name: 'Google Ads', kpi: 'Lead quality', desc: 'Tập trung Search + PMax theo dịch vụ ưu tiên.' },
            { name: 'Meta Ads', kpi: 'CPL', desc: 'Xây phễu 3 tầng: nhận diện, quan tâm, chuyển đổi.' },
            { name: 'TikTok Ads', kpi: 'Reach to lead', desc: 'Creative ngắn, test nhanh theo cụm thông điệp.' },
        ],
    }
}

export async function getUserBlog() {
    const { data } = await apiClient.get(API_ENDPOINTS.user.blog)
    return data
}

export async function getAdminDocuments() {
    const { data } = await apiClient.get(API_ENDPOINTS.documents.list)
    return (data.documents || []).map(createDocumentStruct)
}

export async function uploadAdminDocument(file) {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await apiClient.post(API_ENDPOINTS.documents.upload, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, 
    })
    return createDocumentStruct(data.document)
}

export async function deleteAdminDocument(docId) {
    await apiClient.delete(API_ENDPOINTS.documents.byId(docId))
}

export async function getBlogPosts() {
    const { data } = await apiClient.get(API_ENDPOINTS.admin.blogPosts)
    return data
}

export async function createBlogPost(payload) {
    const { data } = await apiClient.post(API_ENDPOINTS.admin.blogPosts, payload)
    return data
}

export async function updateBlogPost(id, payload) {
    const { data } = await apiClient.put(API_ENDPOINTS.admin.blogPostById(id), payload)
    return data
}

export async function deleteBlogPost(id) {
    await apiClient.delete(API_ENDPOINTS.admin.blogPostById(id))
}

export async function toggleFeaturedPost(id) {
    const { data } = await apiClient.patch(API_ENDPOINTS.admin.blogPostToggleFeatured(id))
    return data
}

export async function getCategories() {
    const { data } = await apiClient.get(API_ENDPOINTS.admin.categories)
    return data
}

export async function createCategory(payload) {
    const { data } = await apiClient.post(API_ENDPOINTS.admin.categories, payload)
    return data
}

export async function updateCategory(id, payload) {
    const { data } = await apiClient.put(API_ENDPOINTS.admin.categoryById(id), payload)
    return data
}

export async function deleteCategory(id) {
    await apiClient.delete(API_ENDPOINTS.admin.categoryById(id))
}

export async function getServiceCards() {
    const { data } = await apiClient.get(API_ENDPOINTS.admin.homeServiceCards)
    return data
}

export async function createServiceCard(payload) {
    const { data } = await apiClient.post(API_ENDPOINTS.admin.homeServiceCards, payload)
    return data
}

export async function updateServiceCard(id, payload) {
    const { data } = await apiClient.put(API_ENDPOINTS.admin.homeServiceCardById(id), payload)
    return data
}

export async function deleteServiceCard(id) {
    await apiClient.delete(API_ENDPOINTS.admin.homeServiceCardById(id))
}

export async function getPainPoints() {
    const { data } = await apiClient.get(API_ENDPOINTS.admin.homePainPoints)
    return data
}

export async function createPainPoint(payload) {
    const { data } = await apiClient.post(API_ENDPOINTS.admin.homePainPoints, payload)
    return data
}

export async function updatePainPoint(id, payload) {
    const { data } = await apiClient.put(API_ENDPOINTS.admin.homePainPointById(id), payload)
    return data
}

export async function deletePainPoint(id) {
    await apiClient.delete(API_ENDPOINTS.admin.homePainPointById(id))
}

export async function getStrengths() {
    const { data } = await apiClient.get(API_ENDPOINTS.admin.homeStrengths)
    return data
}

export async function createStrength(payload) {
    const { data } = await apiClient.post(API_ENDPOINTS.admin.homeStrengths, payload)
    return data
}

export async function updateStrength(id, payload) {
    const { data } = await apiClient.put(API_ENDPOINTS.admin.homeStrengthById(id), payload)
    return data
}

export async function deleteStrength(id) {
    await apiClient.delete(API_ENDPOINTS.admin.homeStrengthById(id))
}

export async function getSeoMetrics() {
    const { data } = await apiClient.get(API_ENDPOINTS.admin.seoServiceMetrics)
    return data
}

export async function createSeoMetric(payload) {
    const { data } = await apiClient.post(API_ENDPOINTS.admin.seoServiceMetrics, payload)
    return data
}

export async function updateSeoMetric(id, payload) {
    const { data } = await apiClient.put(API_ENDPOINTS.admin.seoServiceMetricById(id), payload)
    return data
}

export async function deleteSeoMetric(id) {
    await apiClient.delete(API_ENDPOINTS.admin.seoServiceMetricById(id))
}

export async function getSeoPackages() {
    const { data } = await apiClient.get(API_ENDPOINTS.admin.seoServicePackages)
    return data
}

export async function createSeoPackage(payload) {
    const { data } = await apiClient.post(API_ENDPOINTS.admin.seoServicePackages, payload)
    return data
}

export async function updateSeoPackage(id, payload) {
    const { data } = await apiClient.put(API_ENDPOINTS.admin.seoServicePackageById(id), payload)
    return data
}

export async function deleteSeoPackage(id) {
    await apiClient.delete(API_ENDPOINTS.admin.seoServicePackageById(id))
}

export async function getSeoRoadmap() {
    const { data } = await apiClient.get(API_ENDPOINTS.admin.seoServiceRoadmap)
    return data
}

export async function createSeoRoadmapStep(payload) {
    const { data } = await apiClient.post(API_ENDPOINTS.admin.seoServiceRoadmap, payload)
    return data
}

export async function updateSeoRoadmapStep(id, payload) {
    const { data } = await apiClient.put(API_ENDPOINTS.admin.seoServiceRoadmapById(id), payload)
    return data
}

export async function deleteSeoRoadmapStep(id) {
    await apiClient.delete(API_ENDPOINTS.admin.seoServiceRoadmapById(id))
}

export async function getDesignPhases() {
    const { data } = await apiClient.get(API_ENDPOINTS.admin.webDesignPhases)
    return data
}

export async function createDesignPhase(payload) {
    const { data } = await apiClient.post(API_ENDPOINTS.admin.webDesignPhases, payload)
    return data
}

export async function updateDesignPhase(id, payload) {
    const { data } = await apiClient.put(API_ENDPOINTS.admin.webDesignPhaseById(id), payload)
    return data
}

export async function deleteDesignPhase(id) {
    await apiClient.delete(API_ENDPOINTS.admin.webDesignPhaseById(id))
}

export async function getDesignHighlights() {
    const { data } = await apiClient.get(API_ENDPOINTS.admin.webDesignHighlights)
    return data
}

export async function createDesignHighlight(payload) {
    const { data } = await apiClient.post(API_ENDPOINTS.admin.webDesignHighlights, payload)
    return data
}

export async function updateDesignHighlight(id, payload) {
    const { data } = await apiClient.put(API_ENDPOINTS.admin.webDesignHighlightById(id), payload)
    return data
}

export async function deleteDesignHighlight(id) {
    await apiClient.delete(API_ENDPOINTS.admin.webDesignHighlightById(id))
}

export async function getAdsMetrics() {
    const { data } = await apiClient.get(API_ENDPOINTS.admin.adsMetrics)
    return data
}

export async function createAdsMetric(payload) {
    const { data } = await apiClient.post(API_ENDPOINTS.admin.adsMetrics, payload)
    return data
}

export async function updateAdsMetric(id, payload) {
    const { data } = await apiClient.put(API_ENDPOINTS.admin.adsMetricById(id), payload)
    return data
}

export async function deleteAdsMetric(id) {
    await apiClient.delete(API_ENDPOINTS.admin.adsMetricById(id))
}

export async function getAdsChannels() {
    const { data } = await apiClient.get(API_ENDPOINTS.admin.adsChannels)
    return data
}

export async function createAdsChannel(payload) {
    const { data } = await apiClient.post(API_ENDPOINTS.admin.adsChannels, payload)
    return data
}

export async function updateAdsChannel(id, payload) {
    const { data } = await apiClient.put(API_ENDPOINTS.admin.adsChannelById(id), payload)
    return data
}

export async function deleteAdsChannel(id) {
    await apiClient.delete(API_ENDPOINTS.admin.adsChannelById(id))
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

            if (line.startsWith('event: done')) {
                continue
            }

            if (!line.startsWith('data: ')) {
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
    const { data } = await apiClient.get(API_ENDPOINTS.chat.sessions)
    return data.sessions || []
}

export async function getChatSession(sessionId) {
    const { data } = await apiClient.get(API_ENDPOINTS.chat.sessionById(sessionId))
    return data
}
