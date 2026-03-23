import { query, testConnection } from './database.js'
import { fileURLToPath } from 'url'
import { normalize } from 'path'

const createTables = async () => {
  console.log('Iniciando migraciones de base de datos...\n')

  try {
    // Verificar conexión
    const connected = await testConnection()
    if (!connected) {
      throw new Error('No se pudo conectar a la base de datos')
    }

    // 1. Tabla de usuarios
    console.log('Creando tabla usuarios...')
    await query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'organizador', 'asistente', 'guardia')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('Tabla usuarios creada\n')

    // 2. Tabla de eventos
    console.log('Creando tabla eventos...')
    await query(`
      CREATE TABLE IF NOT EXISTS eventos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre VARCHAR(255) NOT NULL,
        fecha DATE NOT NULL,
        sillas_totales INTEGER NOT NULL DEFAULT 100,
        creado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('Tabla eventos creada\n')

    // 3. Tabla de invitados
    console.log('Creando tabla invitados...')
    await query(`
      CREATE TABLE IF NOT EXISTS invitados (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
        nombre VARCHAR(255) NOT NULL,
        apellido VARCHAR(255),
        categoria VARCHAR(50) DEFAULT 'General' CHECK (categoria IN ('General', 'VIP', 'Familia', 'Amigos', 'Trabajo')),
        confirmado BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('Tabla invitados creada\n')

    // 4. Tabla de actividad (auditoría)
    console.log('Creando tabla actividad...')
    await query(`
      CREATE TABLE IF NOT EXISTS actividad (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
        accion VARCHAR(255) NOT NULL,
        detalles JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('Tabla actividad creada\n')

    // 4b. Añadir columnas access_code y su expiración (migración incremental)
    await query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS access_code VARCHAR(12) UNIQUE`)
    await query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS access_code_expires_at TIMESTAMP`)
    console.log('Columnas access_code verificadas\n')

    // 5. Crear índices para mejorar performance
    console.log('Creando índices...')
    await query(`CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_invitados_evento ON invitados(evento_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_invitados_nombre ON invitados(nombre)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_actividad_usuario ON actividad(usuario_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_actividad_fecha ON actividad(created_at DESC)`)
    console.log('Índices creados\n')

    // 6. Crear función para actualizar updated_at automáticamente
    console.log('Creando función de trigger...')
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `)

    // 7. Crear triggers
    await query(`
      DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
      CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `)

    await query(`
      DROP TRIGGER IF EXISTS update_eventos_updated_at ON eventos;
      CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON eventos
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `)

    await query(`
      DROP TRIGGER IF EXISTS update_invitados_updated_at ON invitados;
      CREATE TRIGGER update_invitados_updated_at BEFORE UPDATE ON invitados
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `)
    console.log('Triggers creados\n')

    console.log('Migraciones completadas exitosamente!')

  } catch (error) {
    console.error('Error durante las migraciones:', error)
    throw error
  }
}

// Ejecutar migraciones si se ejecuta directamente
// Normalizar rutas para Windows
const currentFile = fileURLToPath(import.meta.url)
const executedFile = normalize(process.argv[1])

if (currentFile === executedFile || process.argv[1].endsWith('migrate.js')) {
  createTables()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export default createTables
