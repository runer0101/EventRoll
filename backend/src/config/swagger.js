/**
 * Especificación OpenAPI 3.0 para la API de EventRoll.
 * Montada en /api/docs por swagger-ui-express.
 */
export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'EventRoll API',
    version: '1.3.0',
    description: 'Guest management & check-in API — authentication via HttpOnly cookie',
    contact: { name: 'EventRoll' },
  },
  servers: [{ url: '/api/v1', description: 'Servidor principal' }],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'JWT almacenado en cookie HttpOnly. Se envía automáticamente con withCredentials.',
      },
    },
    schemas: {
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          nombre: { type: 'string', example: 'Juan García' },
          email: { type: 'string', format: 'email', example: 'juan@ejemplo.com' },
          rol: {
            type: 'string',
            enum: ['admin', 'organizador', 'asistente', 'guardia', 'visualizador'],
          },
        },
      },
      Invitado: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          evento_id: { type: 'string', nullable: true },
          nombre: { type: 'string', example: 'María' },
          apellido: { type: 'string', nullable: true, example: 'López' },
          categoria: {
            type: 'string',
            enum: ['General', 'VIP', 'Familia', 'Amigos', 'Trabajo'],
          },
          confirmado: { type: 'boolean', default: false },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          total: { type: 'integer' },
          confirmados: { type: 'integer' },
          pendientes: { type: 'integer' },
          page: { type: 'integer' },
          limit: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
        },
      },
    },
  },
  security: [{ cookieAuth: [] }],
  paths: {
    // ─── AUTH ────────────────────────────────────────────────────
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 1 },
                },
              },
              example: { email: 'admin@ejemplo.com', password: 'mi_password' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login exitoso. Token JWT enviado en cookie HttpOnly.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        usuario: { $ref: '#/components/schemas/Usuario' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Credenciales inválidas', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { description: 'Demasiados intentos de login' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Obtener usuario autenticado',
        responses: {
          200: {
            description: 'Datos del usuario actual',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { usuario: { $ref: '#/components/schemas/Usuario' } } } } } } },
          },
          401: { description: 'No autenticado' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Cerrar sesión (limpia la cookie)',
        responses: {
          200: { description: 'Logout exitoso' },
          401: { description: 'No autenticado' },
        },
      },
    },
    // ─── INVITADOS ────────────────────────────────────────────────
    '/invitados': {
      get: {
        tags: ['Invitados'],
        summary: 'Listar invitados con paginación y filtros',
        parameters: [
          { name: 'evento_id', in: 'query', schema: { type: 'integer' }, description: 'ID del evento' },
          { name: 'categoria', in: 'query', schema: { type: 'string', enum: ['General', 'VIP', 'Familia', 'Amigos', 'Trabajo'] } },
          { name: 'confirmado', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string', maxLength: 100 } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 200, default: 50 } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } },
        ],
        responses: {
          200: {
            description: 'Lista paginada de invitados',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        data: { type: 'array', items: { $ref: '#/components/schemas/Invitado' } },
                        pagination: { $ref: '#/components/schemas/PaginationMeta' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'No autenticado' },
        },
      },
      post: {
        tags: ['Invitados'],
        summary: 'Crear un invitado',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre'],
                properties: {
                  nombre: { type: 'string', maxLength: 100 },
                  apellido: { type: 'string', maxLength: 100 },
                  categoria: { type: 'string', enum: ['General', 'VIP', 'Familia', 'Amigos', 'Trabajo'] },
                  evento_id: { type: 'integer' },
                  confirmado: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Invitado creado' },
          400: { description: 'Datos inválidos o invitado duplicado' },
          401: { description: 'No autenticado' },
        },
      },
    },
    '/invitados/import': {
      post: {
        tags: ['Invitados'],
        summary: 'Importar invitados en lote desde Excel',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['invitados'],
                properties: {
                  evento_id: { type: 'integer' },
                  invitados: {
                    type: 'array',
                    maxItems: 1000,
                    items: {
                      type: 'object',
                      required: ['nombre'],
                      properties: {
                        nombre: { type: 'string' },
                        apellido: { type: 'string' },
                        categoria: { type: 'string' },
                        confirmado: { type: 'boolean' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Resultado de importación con conteo de importados, duplicados y errores' },
          400: { description: 'Array vacío o datos inválidos' },
          403: { description: 'Se requiere rol organizador o admin' },
        },
      },
    },
    '/invitados/{id}': {
      put: {
        tags: ['Invitados'],
        summary: 'Actualizar un invitado',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Invitado actualizado' },
          400: { description: 'Sin campos para actualizar' },
          404: { description: 'Invitado no encontrado' },
        },
      },
      delete: {
        tags: ['Invitados'],
        summary: 'Eliminar un invitado',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Invitado eliminado' },
          404: { description: 'Invitado no encontrado' },
        },
      },
    },
    // ─── USUARIOS ─────────────────────────────────────────────────
    '/usuarios': {
      get: {
        tags: ['Usuarios'],
        summary: 'Listar todos los usuarios (solo admin)',
        responses: {
          200: { description: 'Lista de usuarios' },
          403: { description: 'Sin permisos' },
        },
      },
      post: {
        tags: ['Usuarios'],
        summary: 'Crear usuario (solo admin)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre', 'email', 'password', 'rol'],
                properties: {
                  nombre: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  rol: { type: 'string', enum: ['admin', 'organizador', 'asistente', 'guardia'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Usuario creado' },
          400: { description: 'Email ya registrado' },
        },
      },
    },
    '/usuarios/{id}': {
      put: {
        tags: ['Usuarios'],
        summary: 'Actualizar usuario (solo admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Usuario actualizado' }, 404: { description: 'No encontrado' } },
      },
      delete: {
        tags: ['Usuarios'],
        summary: 'Eliminar usuario (solo admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Usuario eliminado' } },
      },
    },
    // ─── RECUPERACIÓN DE CONTRASEÑA ───────────────────────────────
    '/password-recovery/solicitar-codigo': {
      post: {
        tags: ['Recuperación'],
        summary: 'Solicitar código de recuperación (envía email)',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } } } },
        },
        responses: { 200: { description: 'Código enviado (siempre 200 para no revelar existencia de email)' } },
      },
    },
    '/password-recovery/verificar-codigo': {
      post: {
        tags: ['Recuperación'],
        summary: 'Verificar código de 6 dígitos',
        security: [],
        responses: { 200: { description: 'Código válido' }, 400: { description: 'Código inválido o expirado' } },
      },
    },
    '/password-recovery/restablecer-password': {
      post: {
        tags: ['Recuperación'],
        summary: 'Establecer nueva contraseña',
        security: [],
        responses: { 200: { description: 'Contraseña actualizada exitosamente' } },
      },
    },
  },
}
