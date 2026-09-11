import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import supertest from 'supertest'
import app from '../../src/app.js'
import { createTestUser, cleanupTestData, TEST_USER } from './setup.js'

const request = supertest(app)

describe('Usuarios API — integración', () => {
  let adminToken

  beforeAll(async () => {
    await createTestUser(TEST_USER)
    
    // Login as admin to get token
    const loginRes = await request
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password })
    adminToken = loginRes.body.data.token
  })

  afterAll(async () => {
    await cleanupTestData()
  })

  // ─── GET /api/usuarios ─────────────────────────────────────────────
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

    it('retorna 403 sin rol admin', async () => {
      // Create a non-admin user
      const organizer = {
        nombre: 'Test Organizer',
        email: 'test.organizer.usuarios@test.com',
        password: 'TestPass123!',
        rol: 'organizador',
      }
      await createTestUser(organizer)
      
      const loginRes = await request
        .post('/api/v1/auth/login')
        .send({ email: organizer.email, password: organizer.password })
      const organizerToken = loginRes.body.data.token

      const res = await request
        .get('/api/v1/usuarios')
        .set('Authorization', `Bearer ${organizerToken}`)

      expect(res.status).toBe(403)
    })
  })

  // ─── POST /api/usuarios ────────────────────────────────────────────
  describe('POST /api/usuarios', () => {
    it('retorna 201 al crear usuario válido', async () => {
      const newUser = {
        nombre: 'New User',
        email: 'new.user@test.com',
        password: 'TestPass123!',
        rol: 'asistente',
      }

      const res = await request
        .post('/api/v1/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser)

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.usuario.email).toBe(newUser.email)
      expect(res.body.data.usuario.rol).toBe(newUser.rol)
    })

    it('retorna 400 con email inválido', async () => {
      const res = await request
        .post('/api/v1/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Test',
          email: 'invalid-email',
          password: 'TestPass123!',
          rol: 'asistente',
        })

      expect(res.status).toBe(400)
    })

    it('retorna 400 con contraseña débil', async () => {
      const res = await request
        .post('/api/v1/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Test',
          email: 'test.weak@test.com',
          password: '123',
          rol: 'asistente',
        })

      expect(res.status).toBe(400)
    })

    it('retorna 400 con rol inválido', async () => {
      const res = await request
        .post('/api/v1/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Test',
          email: 'test.invalid@test.com',
          password: 'TestPass123!',
          rol: 'invalid-role',
        })

      expect(res.status).toBe(400)
    })
  })

  // ─── PUT /api/usuarios/:id ─────────────────────────────────────────
  describe('PUT /api/usuarios/:id', () => {
    let userId

    beforeEach(async () => {
      // Create a user to update
      const res = await request
        .post('/api/v1/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'User To Update',
          email: 'update.test@test.com',
          password: 'TestPass123!',
          rol: 'asistente',
        })
      userId = res.body.data.usuario.id
    })

    it('retorna 200 al actualizar usuario', async () => {
      const res = await request
        .put(`/api/v1/usuarios/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Updated Name' })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it('retorna 400 con ID inválido', async () => {
      const res = await request
        .put('/api/v1/usuarios/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Test' })

      expect(res.status).toBe(400)
    })
  })

  // ─── DELETE /api/usuarios/:id ──────────────────────────────────────
  describe('DELETE /api/usuarios/:id', () => {
    let userId

    beforeEach(async () => {
      // Create a user to delete
      const res = await request
        .post('/api/v1/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'User To Delete',
          email: 'delete.test@test.com',
          password: 'TestPass123!',
          rol: 'asistente',
        })
      userId = res.body.data.usuario.id
    })

    it('retorna 200 al eliminar usuario', async () => {
      const res = await request
        .delete(`/api/v1/usuarios/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it('retorna 400 con ID inválido', async () => {
      const res = await request
        .delete('/api/v1/usuarios/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(400)
    })
  })
})
