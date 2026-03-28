const REQUIRED = [
  { key: 'DATABASE_URL', hint: 'ej: postgresql://user:pass@localhost:5432/dbname' },
  { key: 'JWT_SECRET', hint: 'mínimo 32 caracteres aleatorios' },
]

export const validateEnv = () => {
  const missing = REQUIRED.filter(({ key }) => !process.env[key])

  if (missing.length > 0) {
    const list = missing.map(({ key, hint }) => `  ${key} — ${hint}`).join('\n')
    throw new Error(`Variables de entorno requeridas no encontradas:\n${list}`)
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres')
  }

  const WEAK_SECRETS = [
    'tu-secreto-super-seguro-cambialo-en-produccion-min-32-caracteres',
    'secret', 'jwt_secret', 'changeme', 'desarrollo'
  ]
  if (WEAK_SECRETS.some(w => process.env.JWT_SECRET.toLowerCase().includes(w.toLowerCase()))) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET contiene un valor predecible. Usa un secreto aleatorio.')
    }
  }
}
