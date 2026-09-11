import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import supertest from 'supertest'
import app from '../../src/app.js'
import { createTestUser, cleanupTestData, TEST_USER } from './setup.js'

const request = supertest(app)

describe('Usuarios API — integración', () => {
  let adminToken

  beforeAll(async () => {
    await createTestUser(TEST_USER)
    
    const loginRes = await request
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password })
    adminToken = loginRes.body.data.token
  })

  afterAll(async () => {
    await cleanupTestData()
  })

  describe('GET /api/usuarios', () => {
    it('retorna 200 con lista de usuarios', async () => {
      const res = await request
        .get('/api/v1/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('retorna 401 sin token', async () => {
      const res = await request.get('/api/v1/usuarios')
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/usuarios', () => {
    it('retorna 201 al crear usuario válido', async () => {
      const ts = Date.now()
      const res = await request
        .post('/api/v1/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'New User',
          email: `new.user.${ts}@test.com`,
          password: 'TestPass123!',
          rol: 'asistente',
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.email).toBe(`new.user.${ts}@test.com`)
      expect(res.body.data.rol).toBe('asistente')
    })

    it('retorna 400 con email inválido', async () => {
      const res = await request
        .post('/api/v1/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Test', email: 'invalid-email', password: 'TestPass123!', rol: 'asistente' })

      expect(res.status).toBe(400)
    })

    it('retorna 400 con contraseña débil', async () => {
      const res = await request
        .post('/api/v1/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Test', email: `weak.${Date.now()}@test.com`, password: '123', rol: 'asistente' })

      expect(res.status).toBe(400)
    })
  })

  describe('PUT /api/usuarios/:id', () => {
    let userId

    beforeEach(async () => {
      const ts = Date.now()
      const res = await request
        .post('/api/v1/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'User To Update',
          email: `update.${ts}@test.com`,
          password: 'TestPass123!',
          rol: 'asistente',
        })
      if (res.status === 201) {
        userId = res.body.data.id
      }
    })

    it('retorna 200 al actualizar usuario', async () => {
      if (!userId) return
      const res = await request
        .put(`/api/v1/usuarios/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Updated Name' })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it('retorna 400 con ID inválido', async () => {
      const res = await request
        .put('/api/v1/usuarios/not-a-uuid')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Test' })

      expect(res.status).toBe(400)
    })
  })

  describe('DELETE /api/usuarios/:id', () => {
    let userId

    beforeEach(async () => {
      const ts = Date.now()
      const res = await request
        .post('/api/v1/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'User To Delete',
          email: `delete.${ts}@test.com`,
          password: 'TestPass123!',
          rol: 'asistente',
        })
      if (res.status === 201) {
        userId = res.body.data.id
      }
    })

    it('retorna 200 al eliminar usuario', async () => {
      if (!userId) return
      const res = await request
        .delete(`/api/v1/usuarios/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it('retorna 400 con ID inválido', async () => {
      const res = await request
        .delete('/api/v1/usuarios/not-a-uuid')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(400)
    })
  })
})
