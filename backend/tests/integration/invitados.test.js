import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import supertest from 'supertest'
import app from '../../src/app.js'
import {
  createTestUser,
  createTestEvento,
  cleanupTestData,
  TEST_USER,
} from './setup.js'

const request = supertest(app)

describe('Invitados API — integración', () => {
  let token
  let eventoId
  let invitadoId

  beforeAll(async () => {
    const userId = await createTestUser(TEST_USER)
    eventoId = await createTestEvento(userId)

    const loginRes = await request
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password })
    token = loginRes.body.data.token
  })

  afterAll(async () => {
    await cleanupTestData()
  })

  // ─── GET /api/invitados ────────────────────────────────────────────
  describe('GET /api/invitados', () => {
    it('retorna 200 con lista de invitados', async () => {
      const res = await request
        .get('/api/v1/invitados')
        .query({ evento_id: eventoId })
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.pagination).toBeDefined()
    })

    it('retorna 401 sin autenticación', async () => {
      const res = await request
        .get('/api/v1/invitados')
        .query({ evento_id: eventoId })

      expect(res.status).toBe(401)
    })
  })

  // ─── POST /api/invitados ───────────────────────────────────────────
  describe('POST /api/invitados', () => {
    it('crea un invitado y retorna 201', async () => {
      const res = await request
        .post('/api/v1/invitados')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: 'Test Invitado',
          apellido: 'Apellido',
          categoria: 'General',
          evento_id: eventoId,
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.nombre).toBe('Test Invitado')

      invitadoId = res.body.data.id
    })

    it('retorna 400 si falta el nombre', async () => {
      const res = await request
        .post('/api/v1/invitados')
        .set('Authorization', `Bearer ${token}`)
        .send({ evento_id: eventoId, categoria: 'General' })

      expect(res.status).toBe(400)
    })
  })

  // ─── PUT /api/invitados/:id ────────────────────────────────────────
  describe('PUT /api/invitados/:id', () => {
    it('actualiza el invitado correctamente', async () => {
      const res = await request
        .put(`/api/v1/invitados/${invitadoId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ confirmado: true })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.confirmado).toBe(true)
    })

    it('retorna 404 con id inexistente', async () => {
      const res = await request
        .put('/api/v1/invitados/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .send({ confirmado: true })

      expect(res.status).toBe(404)
    })
  })

  // ─── DELETE /api/invitados/:id ─────────────────────────────────────
  describe('DELETE /api/invitados/:id', () => {
    it('elimina el invitado correctamente', async () => {
      const res = await request
        .delete(`/api/v1/invitados/${invitadoId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it('retorna 404 al eliminar id inexistente', async () => {
      const res = await request
        .delete('/api/v1/invitados/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(404)
    })
  })
})
