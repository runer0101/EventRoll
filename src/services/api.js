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
    // Los endpoints de login devuelven 401 por credenciales incorrectas — no son
    // sesiones expiradas, así que no deben redirigir al home.
    const isLoginEndpoint = error.config?.url?.includes('/auth/login')
    const isSessionCheck  = error.config?.url?.includes('/auth/me')


    if (error.response?.status === 401 && !isSessionCheck && !isLoginEndpoint) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.location.href = '/'
    }

    // Determinar mensaje según el tipo de fallo
    let errorMessage
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorMessage = 'La solicitud tardó demasiado. Verifica tu conexión e inténtalo de nuevo.'
    } else if (!error.response) {
      errorMessage = 'Sin conexión al servidor. Verifica tu red e inténtalo de nuevo.'
    } else if (error.response.status >= 500) {
      errorMessage = error.response.data?.message || 'Error interno del servidor. Inténtalo más tarde.'
    } else {
      errorMessage = error.response.data?.message || error.message || 'Error desconocido'
    }

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      requestId: error.response?.data?.requestId || error.response?.headers?.['x-request-id'] || null,
      data: error.response?.data,
    })
  }
)

// ========== AUTENTICACIÓN ==========

export const authAPI = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/v1/auth/login', { email, password })
    return response.data
  },

  // Obtener usuario actual
  getMe: async () => {
    const response = await api.get('/v1/auth/me')
    return response.data
  },

  // Logout
  logout: async () => {
    const response = await api.post('/v1/auth/logout')
    return response.data
  },

  // Login con código de acceso
  loginConCodigo: async (codigo) => {
    const response = await api.post('/v1/auth/login-con-codigo', { codigo })
    return response.data
  }
}

// ========== USUARIOS ==========

export const usuariosAPI = {
  // Obtener todos los usuarios
  getAll: async () => {
    const response = await api.get('/v1/usuarios')
    return response.data
  },

  // Crear usuario
  create: async (userData) => {
    const response = await api.post('/v1/usuarios', userData)
    return response.data
  },

  // Actualizar usuario
  update: async (id, userData) => {
    const response = await api.put(`/v1/usuarios/${id}`, userData)
    return response.data
  },

  // Eliminar usuario
  delete: async (id) => {
    const response = await api.delete(`/v1/usuarios/${id}`)
    return response.data
  },

  // Generar código de acceso
  generarCodigo: async (id) => {
    const response = await api.post(`/v1/usuarios/${id}/generar-codigo`)
    return response.data
  },

  // Revocar código de acceso
  revocarCodigo: async (id) => {
    const response = await api.delete(`/v1/usuarios/${id}/revocar-codigo`)
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

    const response = await api.get(`/v1/invitados?${params.toString()}`)
    return response.data
  },

  // Crear invitado
  create: async (invitadoData) => {
    const response = await api.post('/v1/invitados', invitadoData)
    return response.data
  },

  // Actualizar invitado
  update: async (id, invitadoData) => {
    const response = await api.put(`/v1/invitados/${id}`, invitadoData)
    return response.data
  },

  // Eliminar invitado
  delete: async (id) => {
    const response = await api.delete(`/v1/invitados/${id}`)
    return response.data
  },

  // Importar múltiples invitados
  import: async (invitados, evento_id = null) => {
    const response = await api.post('/v1/invitados/import', {
      invitados,
      evento_id
    })
    return response.data
  }
}

// ========== EVENTOS ==========

export const eventosAPI = {
  // Obtener todos los eventos
  getAll: async () => {
    const response = await api.get('/v1/eventos')
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
