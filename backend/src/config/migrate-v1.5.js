import { query, testConnection } from './database.js'
import { fileURLToPath } from 'url'
import { normalize } from 'path'
import { ensureMigrationsTable, isApplied, markApplied } from './migrationHelper.js'

const migrarRecuperacionPassword = async () => {
  console.log('Iniciando migración v1.5 - Sistema de Recuperación de Contraseña...\n')

  try {
    // Verificar conexión
    const connected = await testConnection()
    if (!connected) {
      throw new Error('No se pudo conectar a la base de datos')
    }

    await ensureMigrationsTable()

    if (await isApplied('v1.5')) {
      console.log('Migración v1.5 ya aplicada, omitiendo.\n')
      return
    }

    // Crear tabla de códigos de recuperación
    console.log('Creando tabla password_recovery_codes...')
    await query(`
      CREATE TABLE IF NOT EXISTS password_recovery_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        codigo VARCHAR(6) NOT NULL,
        usado BOOLEAN DEFAULT FALSE,
        expira_en TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('Tabla password_recovery_codes creada\n')

    // Crear tabla de configuración de emails del cliente
    console.log('Creando tabla email_config...')
    await query(`
      CREATE TABLE IF NOT EXISTS email_config (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        clave VARCHAR(100) UNIQUE NOT NULL,
        valor TEXT NOT NULL,
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('Tabla email_config creada\n')

    // Insertar configuración por defecto
    console.log('Insertando configuración de email por defecto...')
    await query(`
      INSERT INTO email_config (clave, valor, descripcion)
      VALUES
        ('email_cliente_backup', '', 'Email del cliente que recibe copia de códigos de recuperación'),
        ('email_notificaciones', 'true', 'Activar/desactivar envío de emails')
      ON CONFLICT (clave) DO NOTHING
    `)
    console.log('Configuración insertada\n')

    // Crear índices
    console.log('Creando índices...')
    await query(`CREATE INDEX IF NOT EXISTS idx_recovery_usuario ON password_recovery_codes(usuario_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_recovery_codigo ON password_recovery_codes(codigo)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_recovery_expira ON password_recovery_codes(expira_en)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_email_config_clave ON email_config(clave)`)
    console.log('Índices creados\n')

    // Crear trigger para updated_at en email_config
    await query(`
      DROP TRIGGER IF EXISTS update_email_config_updated_at ON email_config;
      CREATE TRIGGER update_email_config_updated_at BEFORE UPDATE ON email_config
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `)

    await markApplied('v1.5')

    console.log('Migración v1.5 completada exitosamente!\n')
    console.log('Tablas creadas:')
    console.log('   - password_recovery_codes')
    console.log('   - email_config\n')

  } catch (error) {
    console.error('Error durante la migración:', error)
    throw error
  }
}

// Ejecutar migración si se ejecuta directamente
const currentFile = fileURLToPath(import.meta.url)
const executedFile = normalize(process.argv[1])

if (currentFile === executedFile || process.argv[1].endsWith('migrate-v1.5.js')) {
  migrarRecuperacionPassword()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export default migrarRecuperacionPassword
