import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  throw new Error('VITE_API_URL is not defined. Create a .env file with VITE_API_URL=http://localhost:3000/api')
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  // withCredentials envía las cookies HttpOnly en cada petición cross-origin
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor de respuesta: sesión expirada → limpiar y redirigir
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // /auth/me se usa para verificar si hay sesión activa — un 401 ahí es
    // comportamiento esperado (usuario no autenticado), no un error de sesión expirada.
    const isSessionCheck = error.config?.url?.includes('/auth/me')

    if (error.response?.status === 401 && !isSessionCheck) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.location.href = '/'
    }

    const errorMessage = error.response?.data?.message || error.message || 'Error desconocido'

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    })
  }
)

// ========== AUTENTICACIÓN ==========

export const authAPI = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  // Obtener usuario actual
  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  }
}

// ========== USUARIOS ==========

export const usuariosAPI = {
  // Obtener todos los usuarios
  getAll: async () => {
    const response = await api.get('/usuarios')
    return response.data
  },

  // Crear usuario
  create: async (userData) => {
    const response = await api.post('/usuarios', userData)
    return response.data
  },

  // Actualizar usuario
  update: async (id, userData) => {
    const response = await api.put(`/usuarios/${id}`, userData)
    return response.data
  },

  // Eliminar usuario
  delete: async (id) => {
    const response = await api.delete(`/usuarios/${id}`)
    return response.data
  }
}

// ========== INVITADOS ==========

export const invitadosAPI = {
  // Obtener todos los invitados con filtros opcionales
  getAll: async (filters = {}) => {
    const params = new URLSearchParams()

    if (filters.evento_id) params.append('evento_id', filters.evento_id)
    if (filters.categoria) params.append('categoria', filters.categoria)
    if (filters.confirmado !== undefined) params.append('confirmado', filters.confirmado)
    if (filters.search) params.append('search', filters.search)
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    if (filters.order) params.append('order', filters.order)

    const response = await api.get(`/invitados?${params.toString()}`)
    return response.data
  },

  // Crear invitado
  create: async (invitadoData) => {
    const response = await api.post('/invitados', invitadoData)
    return response.data
  },

  // Actualizar invitado
  update: async (id, invitadoData) => {
    const response = await api.put(`/invitados/${id}`, invitadoData)
    return response.data
  },

  // Eliminar invitado
  delete: async (id) => {
    const response = await api.delete(`/invitados/${id}`)
    return response.data
  },

  // Importar múltiples invitados
  import: async (invitados, evento_id = null) => {
    const response = await api.post('/invitados/import', {
      invitados,
      evento_id
    })
    return response.data
  }
}

// ========== HELPERS ==========

// Limpiar sesión local (cookies gestionadas por el servidor vía /api/auth/logout)
export const removeToken = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
}

// Exportar instancia principal
export default api
