import axios from 'axios'

// In development the Vite proxy rewrites /api → http://localhost:3001.
// In production set VITE_API_URL to the absolute backend URL, e.g.:
//   VITE_API_URL=https://api.tatflow.com
// Leave it empty to keep using a server-side /api proxy.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
})

/**
 * Safely extracts a human-readable string from any Axios error response,
 * preventing raw objects from leaking into React state.
 */
export function extractApiError(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: unknown } })?.response?.data
  if (typeof data === 'string' && data.length > 0 && !data.startsWith('<')) return data
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>
    if (typeof d.error === 'string') return d.error
    if (typeof d.message === 'string') return d.message
  }
  return fallback
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tatflow_token') || sessionStorage.getItem('tatflow_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api

// Auth
export const authAPI = {
  register: (data: Record<string, string>) => api.post('/auth/register', data),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  checkSlug: (slug: string) => api.get(`/auth/check-slug/${slug}`),
  updateSlug: (slug: string) => api.patch('/auth/slug', { slug }),
  updateWhatsappMessage: (whatsappMessage: string) => api.patch('/auth/whatsapp-message', { whatsappMessage }),
  updateStudioName: (studioName: string) => api.patch('/auth/studio-name', { studioName }),
  updateRequireReferenceImages: (requireReferenceImages: boolean) => api.patch('/auth/require-reference-images', { requireReferenceImages }),
}

// Requests
export const requestAPI = {
  create: (data: FormData) =>
    api.post('/requests', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  list: (status?: string) => api.get('/requests', { params: status ? { status } : {} }),
  get: (id: string) => api.get(`/requests/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`/requests/${id}/status`, { status }),
  resolveArtist: (identifier: string) => api.get(`/requests/artist/${identifier}`),
}

// Quotes
export const quoteAPI = {
  create: (data: { requestId: string; priceEstimate: number; sessionTime: string; message: string }) =>
    api.post('/quotes', data),
  list: () => api.get('/quotes'),
  accept: (id: string) => api.patch(`/quotes/${id}/accept`),
}

// Appointments
export const appointmentAPI = {
  create: (data: { requestId: string; date: string; startTime: string; endTime: string; notes?: string }) =>
    api.post('/appointments', data),
  createManual: (data: { clientName: string; date: string; startTime: string; endTime: string; notes?: string }) =>
    api.post('/appointments/manual', data),
  list: () => api.get('/appointments'),
  update: (id: string, data: Partial<{ date: string; startTime: string; endTime: string; notes: string }>) =>
    api.patch(`/appointments/${id}`, data),
  cancel: (id: string) => api.delete(`/appointments/${id}`),
}

// Availability
export const availabilityAPI = {
  get: (artistId: string) => api.get(`/availability/${artistId}`),
  set: (data: {
    schedule: {
      dayOfWeek: number
      startTime: string
      endTime: string
      lunchStart?: string
      lunchEnd?: string
      slotDuration?: number
    }[]
    blockedPeriods: {
      date: string
      startTime?: string
      endTime?: string
    }[]
  }) =>
    api.put('/availability', data),
  getSlots: (artistId: string, date: string) =>
    api.get(`/availability/${artistId}/slots`, { params: { date } }),
}
