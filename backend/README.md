# 🚀 YSSEL Backend API

Backend REST API para el sistema de gestión de eventos YSSEL.

## 📋 Stack Tecnológico

- **Node.js** 18+
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **bcrypt** - Hash de contraseñas

## 🧱 Arquitectura Backend

El backend sigue una estructura por capas para separar responsabilidades:

- **Routes**: definen endpoints y middleware HTTP
- **Controllers**: traducen request/response sin lógica de dominio
- **Services**: concentran reglas de negocio y casos de uso
- **Repositories**: encapsulan acceso a datos (SQL)
- **Core Errors**: errores tipados con códigos HTTP consistentes

Esto reduce acoplamiento, facilita pruebas y mejora mantenibilidad en un repositorio público.

## 🛠️ Instalación Local

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus valores
```

### 3. Configurar PostgreSQL

#### Opción A: PostgreSQL Local
```bash
# Instalar PostgreSQL (si no lo tienes)
# macOS: brew install postgresql
# Linux: sudo apt-get install postgresql
# Windows: descargar de postgresql.org

# Crear base de datos
createdb yssel

# Actualizar DATABASE_URL en .env
DATABASE_URL=postgresql://tu_usuario:tu_contraseña@localhost:5432/yssel
```

#### Opción B: PostgreSQL en la nube (Railway/Render)
```bash
# Railway proporciona la DATABASE_URL automáticamente
# Solo copia la URL que te dan
```

### 4. Crear tablas
```bash
npm run migrate
```

### 5. Poblar con datos de ejemplo (opcional)
```bash
npm run seed
```

### 6. Iniciar servidor
```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

El servidor estará corriendo en `http://localhost:3000`

## 📡 Endpoints API

### Autenticación

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@prueba",
  "password": "<REPLACE_WITH_SECURE_PASSWORD>"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": "uuid",
      "nombre": "Administrador",
      "email": "admin@prueba",
      "rol": "admin"
    }
  }
}
```

#### Obtener usuario actual
```http
GET /api/auth/me
Authorization: Bearer {token}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

### Usuarios (Solo Admin)

#### Listar usuarios
```http
GET /api/usuarios
Authorization: Bearer {token}
```

#### Crear usuario
```http
POST /api/usuarios
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan@prueba",
  "password": "<REPLACE_WITH_SECURE_PASSWORD>",
  "rol": "guardia"
}
```

#### Actualizar usuario
```http
PUT /api/usuarios/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "Juan Actualizado",
  "rol": "asistente"
}
```

#### Eliminar usuario
```http
DELETE /api/usuarios/:id
Authorization: Bearer {token}
```

### Invitados

#### Listar invitados (con filtros)
```http
GET /api/invitados?categoria=VIP&confirmado=true&search=Juan
Authorization: Bearer {token}
```

#### Crear invitado
```http
POST /api/invitados
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "María",
  "apellido": "González",
  "categoria": "VIP",
  "confirmado": false
}
```

#### Actualizar invitado
```http
PUT /api/invitados/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "confirmado": true
}
```

#### Eliminar invitado
```http
DELETE /api/invitados/:id
Authorization: Bearer {token}
```

#### Importar múltiples invitados
```http
POST /api/invitados/import
Authorization: Bearer {token}
Content-Type: application/json

{
  "invitados": [
    {
      "nombre": "Carlos",
      "apellido": "Ruiz",
      "categoria": "Familia"
    },
    {
      "nombre": "Ana",
      "apellido": "Torres",
      "categoria": "Amigos"
    }
  ]
}
```

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Autenticación JWT
- ✅ Rate limiting (100 requests/15min)
- ✅ Helmet para seguridad de headers
- ✅ CORS configurado
- ✅ Validación de entrada
- ✅ SQL injection prevention (parametrized queries)

### Recomendación para repositorio público

- Mantén `EXPOSE_ERROR_STACK` sin definir o en `false` en cualquier despliegue compartido.
- Solo habilita `EXPOSE_ERROR_STACK=true` en depuración local controlada.
- Nunca subas archivos `.env` ni valores reales de `JWT_SECRET`, `DATABASE_URL` o credenciales SMTP.

## 📊 Base de Datos

### Esquema

```sql
usuarios
├── id (UUID, PK)
├── nombre (VARCHAR)
├── email (VARCHAR, UNIQUE)
├── password_hash (VARCHAR)
├── rol (VARCHAR)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

eventos
├── id (UUID, PK)
├── nombre (VARCHAR)
├── fecha (DATE)
├── sillas_totales (INTEGER)
├── creado_por (UUID, FK → usuarios)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

invitados
├── id (UUID, PK)
├── evento_id (UUID, FK → eventos)
├── nombre (VARCHAR)
├── apellido (VARCHAR)
├── categoria (VARCHAR)
├── confirmado (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

actividad (auditoría)
├── id (UUID, PK)
├── usuario_id (UUID, FK → usuarios)
├── accion (VARCHAR)
├── detalles (JSONB)
└── created_at (TIMESTAMP)
```

## 🚀 Deployment

### Railway

1. Crear cuenta en [Railway.app](https://railway.app)

2. Crear nuevo proyecto con PostgreSQL

3. Conectar repositorio de GitHub

4. Configurar variables de entorno:
   ```
   DATABASE_URL=postgresql://... (proporcionada por Railway)
   JWT_SECRET=tu-secreto-super-seguro-de-minimo-32-caracteres
   JWT_EXPIRES_IN=24h
   NODE_ENV=production
   CORS_ORIGIN=https://tu-frontend.netlify.app
   ```

5. Railway detectará automáticamente el `package.json` y ejecutará:
   ```bash
   npm install
   npm start
   ```

6. Ejecutar migraciones (una sola vez):
   ```bash
   # Desde el dashboard de Railway > Shell
   npm run migrate
   npm run seed
   ```

### Render

Similar a Railway:
1. Conectar repo
2. Configurar como "Web Service"
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Agregar PostgreSQL database
6. Configurar variables de entorno

## 🧪 Testing

```bash
# Probar conexión a DB
node src/config/database.js

# Probar migraciones
npm run migrate

# Probar seed
npm run seed

# Health check
curl http://localhost:3000/health

# Test de login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@prueba","password":"<REPLACE_WITH_SECURE_PASSWORD>"}'
```

## 📝 Scripts Disponibles

```bash
npm run dev     # Desarrollo con nodemon
npm start       # Producción
npm run migrate # Crear tablas
npm run seed    # Datos de ejemplo
```

## 🔧 Variables de Entorno

### Variables Requeridas

```env
# Servidor
PORT=3000

# Base de datos
DATABASE_URL=postgresql://user:pass@host:5432/db

# JWT (CRÍTICO: Cambiar en producción)
# Generar con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=secreto-minimo-32-caracteres
JWT_EXPIRES_IN=24h

# Entorno
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Bcrypt
SALT_ROUNDS=10

# Email (para recuperación de contraseña)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
EMAIL_ADMIN_BACKUP=admin@tudominio.com
EMAIL_FROM_NAME=YSSEL - Sistema de Eventos
FRONTEND_URL=http://localhost:5173

# Admin por defecto
DEFAULT_ADMIN_PASSWORD=cambiar-despues-primer-login
```

### ⚠️ Configuración Crítica para Producción

1. **JWT_SECRET**: Debe ser un string aleatorio de al menos 32 caracteres
   ```bash
   # Generar un JWT_SECRET seguro
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **DATABASE_URL**: Cambiar el placeholder `<TU_PASSWORD_DB>` por tu contraseña real

3. **EMAIL_USER y EMAIL_PASS**: Configurar para que funcione la recuperación de contraseña
   - Para Gmail, usa una [App Password](https://support.google.com/accounts/answer/185833)

4. **NODE_ENV**: Debe ser `production` en producción (no `development`)

5. **CORS_ORIGIN**: Debe apuntar a tu dominio de frontend en producción

## 📞 Soporte

- GitHub Issues: [repo]/issues
- Documentación: Este README
- API Docs: `/` endpoint

## 📄 Licencia

MIT

---

<div align="center">

**YSSEL Backend API v1.0.0**

*Sistema de Gestión de Eventos Profesional*

</div>
