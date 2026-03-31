// Cloudflare Worker — Proxy inverso para EventRoll
// Despliega en: https://dash.cloudflare.com → Workers & Pages → Create
// Luego apunta VITE_API_URL del frontend a https://<tu-worker>.workers.dev/api

const BACKEND_ORIGIN = 'https://eventroll.onrender.com'
const ALLOWED_FRONTEND = 'https://runer0101.github.io'

// Rate limiting en memoria (por worker instance — no compartido entre edges)
const requestCounts = new Map()
const RATE_WINDOW_MS = 15 * 60 * 1000 // 15 minutos
const RATE_MAX = 60 // máximo por IP en la ventana

// ASNs conocidos de data centers / hosting / proxies populares
const BLOCKED_ASNS = new Set([
  '14061',  // DigitalOcean
  '16509',  // Amazon AWS
  '15169',  // Google Cloud
  '8075',   // Microsoft Azure
  '13335',  // Cloudflare (Workers recursivos / abuso)
  '24940',  // Hetzner
  '16276',  // OVH
  '63949',  // Linode
  '14618',  // Amazon
  '396982', // Google
])

function isRateLimited(ip) {
  const now = Date.now()
  const entry = requestCounts.get(ip)

  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    requestCounts.set(ip, { count: 1, windowStart: now })
    return false
  }

  entry.count++
  if (entry.count > RATE_MAX) return true
  return false
}

// Limpiar entradas viejas cada 5 minutos para evitar memory leak
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of requestCounts) {
    if (now - entry.windowStart > RATE_WINDOW_MS) {
      requestCounts.delete(ip)
    }
  }
}, 5 * 60 * 1000)

export default {
  async fetch(request) {
    const url = new URL(request.url)
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
    const asn = request.headers.get('CF-ASN') || ''

    // 1. Permitir preflight CORS siempre
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': ALLOWED_FRONTEND,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    // 2. /health pasa siempre (wake-up del frontend)
    const isHealth = url.pathname === '/health'

    // 3. Bloquear ASNs de data centers (excepto /health)
    if (!isHealth && BLOCKED_ASNS.has(asn)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Acceso denegado' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 4. Verificar Origin (excepto /health y GET sin cookies)
    if (!isHealth) {
      const origin = request.headers.get('Origin') || ''
      if (origin && origin !== ALLOWED_FRONTEND) {
        return new Response(
          JSON.stringify({ success: false, message: 'Origen no permitido' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // 5. Rate limiting por IP
    if (!isHealth && isRateLimited(ip)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Demasiadas peticiones. Intenta más tarde.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '900' } }
      )
    }

    // 6. Proxy al backend real
    const backendUrl = `${BACKEND_ORIGIN}${url.pathname}${url.search}`
    const proxyHeaders = new Headers(request.headers)
    proxyHeaders.set('X-Forwarded-For', ip)
    proxyHeaders.set('X-Real-IP', ip)
    // Eliminar headers internos de Cloudflare para no filtrarlos al backend
    proxyHeaders.delete('CF-Connecting-IP')
    proxyHeaders.delete('CF-ASN')
    proxyHeaders.delete('CF-IPCountry')

    try {
      const response = await fetch(backendUrl, {
        method: request.method,
        headers: proxyHeaders,
        body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
      })

      // Clonar response para agregar headers CORS
      const newHeaders = new Headers(response.headers)
      newHeaders.set('Access-Control-Allow-Origin', ALLOWED_FRONTEND)
      newHeaders.set('Access-Control-Allow-Credentials', 'true')

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      })
    } catch (err) {
      return new Response(
        JSON.stringify({ success: false, message: 'Backend no disponible' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      )
    }
  },
}
