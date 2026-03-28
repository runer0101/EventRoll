/**
 * Script de Migración de localStorage a Backend
 *
 * Este script migra todos los datos de localStorage (modo demo)
 * a la base de datos PostgreSQL del backend.
 *
 * Uso:
 * 1. Asegúrate de que el backend esté corriendo
 * 2. Importa esta función en tu componente
 * 3. Llama a migrateToBackend() con el token de admin
 */

import { invitadosAPI, usuariosAPI } from '../services/api'

const isDev = import.meta.env.DEV

function log(msg) {
  if (isDev) console.info(`[migración] ${msg}`)
}

/**
 * Migra invitados desde localStorage al backend
 * @returns {Object} Resultado de la migración
 */
async function migrarInvitados() {
  const resultado = {
    total: 0,
    exitosos: 0,
    errores: [],
    migrados: []
  }

  try {
    const invitadosGuardados = localStorage.getItem('invitados')

    if (!invitadosGuardados) {
      log('No hay invitados en localStorage para migrar')
      return resultado
    }

    const invitados = JSON.parse(invitadosGuardados)
    resultado.total = invitados.length

    log(`Encontrados ${invitados.length} invitados en localStorage`)

    const invitadosParaImportar = invitados.map(inv => ({
      nombre: inv.nombre || '',
      apellido: inv.apellido || '',
      categoria: inv.categoria || 'General',
      confirmado: inv.confirmado || false
    }))

    const response = await invitadosAPI.import(invitadosParaImportar, 1)

    if (response.success && response.data) {
      resultado.exitosos = response.data.importados
      resultado.errores = response.data.errores || []
      resultado.migrados = invitados

      log(`Migrados ${resultado.exitosos} invitados correctamente`)

      if (response.data.duplicados > 0) {
        log(`${response.data.duplicados} invitados duplicados omitidos`)
      }
    }

  } catch (error) {
    console.error('Error al migrar invitados:', error)
    resultado.errores.push({ tipo: 'general', mensaje: error.message })
  }

  return resultado
}

/**
 * Migra usuarios desde localStorage al backend
 * @returns {Object} Resultado de la migración
 */
async function migrarUsuarios() {
  const resultado = {
    total: 0,
    exitosos: 0,
    errores: [],
    migrados: []
  }

  try {
    const usuariosGuardados = localStorage.getItem('usuarios')

    if (!usuariosGuardados) {
      log('No hay usuarios en localStorage para migrar')
      return resultado
    }

    const usuarios = JSON.parse(usuariosGuardados)
    resultado.total = usuarios.length

    log(`Encontrados ${usuarios.length} usuarios en localStorage`)

    for (const usuario of usuarios) {
      try {
        const response = await usuariosAPI.create({
          nombre: usuario.nombre,
          email: usuario.email,
          password: usuario.password,
          rol: usuario.rol
        })

        if (response.success) {
          resultado.exitosos++
          resultado.migrados.push(usuario)
          log('Usuario migrado correctamente')
        }
      } catch (error) {
        console.error('Error al migrar usuario:', error)
        resultado.errores.push({ mensaje: error.message })
      }
    }

  } catch (error) {
    console.error('Error al migrar usuarios:', error)
    resultado.errores.push({ tipo: 'general', mensaje: error.message })
  }

  return resultado
}

/**
 * Función principal de migración
 * Migra todos los datos de localStorage al backend
 *
 * @param {Object} opciones - Opciones de migración
 * @param {boolean} opciones.limpiarLocalStorage - Si debe limpiar localStorage después de migrar
 * @returns {Object} Resultado completo de la migración
 */
export async function migrateToBackend(opciones = {}) {
  const { limpiarLocalStorage = false } = opciones

  log('Iniciando migración de localStorage a Backend...')

  const resultado = {
    invitados: null,
    usuarios: null,
    exito: false,
    timestamp: new Date().toISOString()
  }

  try {
    resultado.invitados = await migrarInvitados()
    resultado.usuarios = await migrarUsuarios()

    const invitadosOk = resultado.invitados.exitosos > 0 || resultado.invitados.total === 0
    const usuariosOk = resultado.usuarios.exitosos > 0 || resultado.usuarios.total === 0
    resultado.exito = invitadosOk && usuariosOk

    log(`Invitados: ${resultado.invitados.exitosos}/${resultado.invitados.total} migrados`)
    log(`Usuarios: ${resultado.usuarios.exitosos}/${resultado.usuarios.total} migrados`)

    if (resultado.exito && limpiarLocalStorage) {
      localStorage.removeItem('invitados')
      localStorage.removeItem('usuarios')
      log('localStorage limpiado')
    }

  } catch (error) {
    console.error('Error crítico durante la migración:', error)
    resultado.exito = false
    resultado.error = error.message
  }

  return resultado
}

/**
 * Verifica si hay datos en localStorage que puedan ser migrados
 * @returns {Object} Información sobre datos disponibles para migrar
 */
export function checkMigrationData() {
  const invitadosGuardados = localStorage.getItem('invitados')
  const usuariosGuardados = localStorage.getItem('usuarios')

  let invitadosCount = 0
  let usuariosCount = 0

  try {
    if (invitadosGuardados) {
      const invitados = JSON.parse(invitadosGuardados)
      invitadosCount = Array.isArray(invitados) ? invitados.length : 0
    }
  } catch (e) {
    console.error('Error al leer invitados de localStorage:', e)
  }

  try {
    if (usuariosGuardados) {
      const usuarios = JSON.parse(usuariosGuardados)
      usuariosCount = Array.isArray(usuarios) ? usuarios.length : 0
    }
  } catch (e) {
    console.error('Error al leer usuarios de localStorage:', e)
  }

  return {
    hayDatos: invitadosCount > 0 || usuariosCount > 0,
    invitados: invitadosCount,
    usuarios: usuariosCount,
    total: invitadosCount + usuariosCount
  }
}

export default { migrateToBackend, checkMigrationData }
