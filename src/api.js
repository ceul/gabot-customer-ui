import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// Attach JWT token and restaurant ID to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  try {
    const restaurant = JSON.parse(localStorage.getItem('restaurant'))
    if (restaurant?.id) {
      config.headers['X-Restaurant-Id'] = restaurant.id
    }
  } catch { /* ignore parse errors */ }
  return config
})

// Handle 401 responses — clear session and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('restaurant')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const auth = {
  login: (data) => api.post('/auth/login', data).then(r => r.data),
  selectRestaurant: (data) => api.post('/auth/select-restaurant', data).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
  register: (data) => api.post('/auth/register', data).then(r => r.data),
}

export const restaurant = {
  get: () => api.get('/restaurant').then(r => r.data),
  update: (data) => api.put('/restaurant', data).then(r => r.data),
}

export const bot = {
  get: () => api.get('/bot').then(r => r.data),
  update: (data) => api.put('/bot', data).then(r => r.data),
  test: (data) => api.post('/bot/test', data).then(r => r.data),
}

export const hours = {
  get: () => api.get('/hours').then(r => r.data),
  updateDay: (day, data) => api.put(`/hours/${day}`, data).then(r => r.data),
}

export const menu = {
  get: () => api.get('/menu').then(r => r.data),
  createCategory: (data) => api.post('/menu/categories', data).then(r => r.data),
  updateCategory: (id, data) => api.put(`/menu/categories/${id}`, data).then(r => r.data),
  deleteCategory: (id) => api.delete(`/menu/categories/${id}`).then(r => r.data),
  createItem: (catId, data) => api.post(`/menu/categories/${catId}/items`, data).then(r => r.data),
  updateItem: (id, data) => api.put(`/menu/items/${id}`, data).then(r => r.data),
  deleteItem: (id) => api.delete(`/menu/items/${id}`).then(r => r.data),
  importFile: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/menu/import', form).then(r => r.data)
  },
}

export const conversations = {
  list: () => api.get('/conversations').then(r => r.data),
  get: (phone) => api.get(`/conversations/${encodeURIComponent(phone)}`).then(r => r.data),
  send: (phone, message) => api.post(`/conversations/${encodeURIComponent(phone)}/send`, { message }).then(r => r.data),
}

export const specials = {
  get: () => api.get('/specials').then(r => r.data),
  create: (data) => api.post('/specials', data).then(r => r.data),
  update: (id, data) => api.put(`/specials/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/specials/${id}`).then(r => r.data),
}

export const orders = {
  list: (params) => api.get('/orders', { params }).then(r => r.data),
  get: (id) => api.get(`/orders/${id}`).then(r => r.data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }).then(r => r.data),
}

export const paymentMethods = {
  get: () => api.get('/payment-methods').then(r => r.data),
  update: (id, data) => api.put(`/payment-methods/${id}`, data).then(r => r.data),
  create: (data) => api.post('/payment-methods', data).then(r => r.data),
  delete: (id) => api.delete(`/payment-methods/${id}`).then(r => r.data),
}

export const metaCredentials = {
  get: () => api.get('/restaurant/meta-credentials').then(r => r.data),
  update: (data) => api.put('/restaurant/meta-credentials', data).then(r => r.data),
}
