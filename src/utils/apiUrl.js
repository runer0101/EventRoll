const PROD_FALLBACK_API_URL = 'https://eventroll.onrender.com/api'
const DEV_FALLBACK_API_URL = 'http://localhost:3000/api'

function normalizeApiPath(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/'

  if (clean.endsWith('/api/v1')) return clean.replace(/\/v1$/, '')
  if (clean.endsWith('/api')) return clean
  if (clean === '/') return '/api'

  return clean
}

export function resolveApiBaseUrl(rawValue) {
  const raw = String(rawValue || '').trim()

  if (!raw) {
    return import.meta.env.PROD ? PROD_FALLBACK_API_URL : DEV_FALLBACK_API_URL
  }

  try {
    const url = new URL(raw)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid protocol')

    url.pathname = normalizeApiPath(url.pathname)
    url.hash = ''
    url.search = ''

    return url.toString().replace(/\/+$/, '')
  } catch {
    // Si la URL es relativa o inválida en producción, usar backend público.
    if (import.meta.env.PROD) return PROD_FALLBACK_API_URL
    return DEV_FALLBACK_API_URL
  }
}

export function resolveHealthUrl(apiBaseUrl) {
  return apiBaseUrl.replace(/\/api\/?$/, '/health')
}
