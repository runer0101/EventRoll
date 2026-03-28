import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import supertest from 'supertest'
import app from '../../src/app.js'
import { createTestUser, cleanupTestData, TEST_USER } from './setup.js'

const request = supertest(app)

describe('Auth API — integración', () => {
  beforeAll(async () => {
    await createTestUser(TEST_USER)
  })

  afterAll(async () => {
    await cleanupTestData()
  })

  // ─── POST /api/auth/login ──────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    it('retorna 200 y token con credenciales válidas', async () => {
      const res = await request
        .post('/api/v1/auth/login')
        .send({ email: TEST_USER.email, password: TEST_USER.password })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.token).toBeDefined()
      expect(res.body.data.usuario.email).toBe(TEST_USER.email)
      expect(res.body.data.usuario.password_hash).toBeUndefined()
    })

    it('retorna 401 con contraseña incorrecta', async () => {
      const res = await request
        .post('/api/v1/auth/login')
        .send({ email: TEST_USER.email, password: 'wrong-password' })

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })

    it('retorna 401 con email inexistente', async () => {
      const res = await request
        .post('/api/v1/auth/login')
        .send({ email: 'noexiste@test.com', password: 'cualquier' })

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })

    it('retorna 400 si falta el email', async () => {
      const res = await request
        .post('/api/v1/auth/login')
        .send({ password: TEST_USER.password })

      expect(res.status).toBe(400)
    })

    it('establece cookie HttpOnly en login exitoso', async () => {
      const res = await request
        .post('/api/v1/auth/login')
        .send({ email: TEST_USER.email, password: TEST_USER.password })

      const setCookie = res.headers['set-cookie']
      expect(setCookie).toBeDefined()
      const tokenCookie = setCookie?.find((c) => c.startsWith('token='))
      expect(tokenCookie).toBeDefined()
      expect(tokenCookie).toMatch(/HttpOnly/i)
    })
  })

  // ─── GET /api/auth/me ──────────────────────────────────────────────
  describe('GET /api/auth/me', () => {
    let token

    beforeAll(async () => {
      const res = await request
        .post('/api/v1/auth/login')
        .send({ email: TEST_USER.email, password: TEST_USER.password })
      token = res.body.data.token
    })

    it('retorna 200 con el usuario autenticado', async () => {
      const res = await request
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.usuario.email).toBe(TEST_USER.email)
    })

    it('retorna 401 sin token', async () => {
      const res = await request.get('/api/v1/auth/me')
      expect(res.status).toBe(401)
    })

    it('retorna 403 con token inválido', async () => {
      const res = await request
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer token.invalido.aqui')

      expect(res.status).toBe(403)
    })
  })

  // ─── POST /api/auth/logout ─────────────────────────────────────────
  describe('POST /api/auth/logout', () => {
    it('retorna 200 y limpia la cookie', async () => {
      const loginRes = await request
        .post('/api/v1/auth/login')
        .send({ email: TEST_USER.email, password: TEST_USER.password })
      const token = loginRes.body.data.token

      const res = await request
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)

      const setCookie = res.headers['set-cookie']
      const tokenCookie = setCookie?.find((c) => c.startsWith('token='))
      // cookie limpiada: valor vacío o expires en el pasado
      if (tokenCookie) {
        expect(tokenCookie).toMatch(/token=;|Max-Age=0|Expires=Thu, 01 Jan 1970/i)
      }
    })
  })
})
