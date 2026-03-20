import { query } from '../src/config/database.js'
import bcrypt from 'bcrypt'
import readline from 'readline'

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Logger local: solo muestra mensajes de depuración en desarrollo o con --verbose
const devLog = (...args) => {
  if (process.env.NODE_ENV === 'development' || process.argv.includes('--verbose')) {
    console.log(...args)
  }
}

const pregunta = (texto) => {
  return new Promise((resolve) => {
    rl.question(texto, resolve)
  })
}

// Pregunta para ingresar texto secreto (oculta la entrada con asteriscos)
const preguntaSecreta = (texto) => {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin

    const onData = (char) => {
      char = char + ''
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.removeListener('data', onData)
          break
        default:
          process.stdout.write('*')
          break
      }
    }

    stdin.on('data', onData)
    try {
      rl.question(texto, (value) => {
        stdin.removeListener('data', onData)
        process.stdout.write('\n')
        resolve(value)
      })
    } catch (err) {
      stdin.removeListener('data', onData)
      reject(err)
    }
  })
}

async function cambiarPassword() {
  devLog('Script para cambiar contraseña de usuario\n')

  try {
    // 1. Pedir email del usuario
    const rawEmail = await pregunta('Email del usuario: ')
    const email = rawEmail ? rawEmail.trim().toLowerCase() : ''
    // Validación simple de formato de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.error('Email inválido')
      rl.close()
      process.exit(1)
    }

    // 2. Verificar que el usuario existe
    const resultado = await query(
      'SELECT id, nombre, email, rol FROM usuarios WHERE email = $1',
      [email]
    )

    if (resultado.rows.length === 0) {
      console.error('Usuario no encontrado')
      rl.close()
      process.exit(1)
    }

    const usuario = resultado.rows[0]

    // Mostrar detalles solo si se pasa --verbose o estamos en desarrollo
    const verbose = process.argv.includes('--verbose') || process.env.NODE_ENV === 'development'
    if (verbose) {
      devLog(`\nUsuario encontrado:`)
      devLog(`   Nombre: ${usuario.nombre}`)
      devLog(`   Email: ${usuario.email}`)
      devLog(`   Rol: ${usuario.rol}\n`)
    } else {
      console.log(`\nUsuario encontrado: ${usuario.email}`)
    }

    // 3. Pedir nueva contraseña (entrada oculta)
    const nuevaPassword = await preguntaSecreta('Nueva contraseña (mínimo 8 caracteres): ')

    if (nuevaPassword.length < 8) {
      console.error('La contraseña debe tener al menos 8 caracteres')
      rl.close()
      process.exit(1)
    }

    // 4. Confirmar contraseña (entrada oculta)
    const confirmarPassword = await preguntaSecreta('Confirmar contraseña: ')

    if (nuevaPassword !== confirmarPassword) {
      console.error('Las contraseñas no coinciden')
      rl.close()
      process.exit(1)
    }

    // Determina si mostrar la contraseña en salida (solo con flag --reveal en development o con SHOW_PASSWORDS=true en dev)
    const reveal = (process.argv.includes('--reveal') || process.env.SHOW_PASSWORDS === 'true') && process.env.NODE_ENV === 'development'

    // 5. Hashear la nueva contraseña
    devLog('\nGenerando hash seguro...')
    const passwordHash = await bcrypt.hash(nuevaPassword, SALT_ROUNDS)

    // 6. Actualizar en la base de datos
    await query(
      'UPDATE usuarios SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, usuario.id]
    )

    // Mensaje mínimo y no exponer la contraseña en la salida
    console.log('\nContraseña actualizada exitosamente!')
    console.log(`   Email: ${usuario.email}`)

    if (reveal) {
      // Solo en desarrollo y bajo flag explícito mostramos la contraseña (con advertencia)
      console.log('   Password: (mostrada en modo desarrollo)')
      console.log('\nAtencion: estas mostrando la contraseña en la salida (modo desarrollo). No uses esto en producción.')
    } else {
      console.log('   Password: (oculta por seguridad)')
      if (process.env.NODE_ENV === 'development') {
        devLog('\nLa nueva contraseña no se muestra en la salida. Si necesitas verla temporalmente, vuelve a ejecutar el script con el flag --reveal (solo en entorno de desarrollo).')
      }
    }

    // Cerrar readline y salir con éxito
    rl.close()
    process.exit(0)

  } catch (error) {
    console.error('Error:', error.message)
    rl.close()
    process.exit(1)
  }
}

cambiarPassword()
