import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

// 响应拦截
api.interceptors.response.use(
  res => res.data,
  err => {
    const msg = err.response?.data?.message || '网络错误，请稍后重试'
    return Promise.reject(new Error(msg))
  }
)

// ===== 校园信息 =====
export const getArticles = (params) => api.get('/campus/articles', { params })
export const getArticleBySlug = (slug) => api.get(`/campus/articles/${slug}`)
export const getArticleById = (id) => api.get(`/campus/articles/detail/${id}`)
export const createArticle = (data) => api.post('/admin/articles', data)
export const updateArticle = (data) => api.put(`/admin/articles/${data.id}`, data)
export const deleteArticle = (id) => api.delete(`/admin/articles/${id}`)

// ===== 地图热点 =====
export const getHotspots = (category) => api.get('/hotspots', { params: { category } })
export const getHotspotsAdmin = () => api.get('/admin/hotspots')
export const getHotspotById = (id) => api.get(`/hotspots/${id}`)
export const createHotspot = (data) => api.post('/admin/hotspots', data)
export const updateHotspot = (data) => api.put(`/admin/hotspots/${data.id}`, data)
export const deleteHotspot = (id) => api.delete(`/admin/hotspots/${id}`)

// ===== AI 对话 (SSE流式) =====
export function chatStream(sessionId, message) {
  const params = new URLSearchParams({ message })
  if (sessionId) params.append('sessionId', sessionId)
  return fetch(`/api/chat/stream?${params.toString()}`)
}

// ===== 管理后台 =====
export const adminLogin = (data) => api.post('/admin/login', data)
export const getKnowledge = (params) => api.get('/admin/knowledge', { params })
export const createKnowledge = (data) => api.post('/admin/knowledge', data)
export const updateKnowledge = (data) => api.put(`/admin/knowledge/${data.id}`, data)
export const deleteKnowledge = (id) => api.delete(`/admin/knowledge/${id}`)

export default api
