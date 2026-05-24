const DEFAULT_ORIGIN = 'http://localhost:5173'

export const normalizeOrigin = (value) => {
  if (!value) return null

  try {
    const url = new URL(String(value).trim())
    if (!['http:', 'https:'].includes(url.protocol)) return null
    return url.origin
  } catch {
    return null
  }
}

export const parseAllowedOrigins = (rawOrigins, fallback = DEFAULT_ORIGIN) => {
  const source = rawOrigins || fallback

  return [...new Set(
    String(source)
      .split(',')
      .map((item) => normalizeOrigin(item))
      .filter(Boolean)
  )]
}

export const isOriginAllowed = (origin, allowedOrigins) => {
  const normalized = normalizeOrigin(origin)
  return !!normalized && allowedOrigins.includes(normalized)
}

export const isRefererAllowed = (referer, allowedOrigins) => {
  const normalized = normalizeOrigin(referer)
  return !!normalized && allowedOrigins.includes(normalized)
}

const extractHostname = (origin) => {
  try {
    return new URL(origin).hostname
  } catch {
    return null
  }
}

export const isSameOriginRequest = (req, allowedOrigins) => {
  const host = req.headers.host || ''
  const scheme = req.protocol || 'http'
  const hostOrigin = `${scheme}://${host.split(':')[0]}`
  return isOriginAllowed(hostOrigin, allowedOrigins)
}

export const isRequestAllowed = (req, allowedOrigins) => {
  const origin = req.headers.origin || ''
  const referer = req.headers.referer || ''

  if (origin) return isOriginAllowed(origin, allowedOrigins)
  if (referer) return isRefererAllowed(referer, allowedOrigins)

  return isSameOriginRequest(req, allowedOrigins)
}

const DEV_HOSTS = ['localhost:3000', 'localhost:5173', '127.0.0.1:3000', '127.0.0.1:5173']

export const isDevHost = (host) => DEV_HOSTS.includes(host)
