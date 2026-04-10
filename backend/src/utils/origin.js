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
