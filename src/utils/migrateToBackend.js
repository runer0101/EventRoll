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
    // Leer invitados de localStorage
    const invitadosGuardados = localStorage.getItem('invitados')

    if (!invitadosGuardados) {
      console.log('No hay invitados en localStorage para migrar')
      return resultado
    }

    const invitados = JSON.parse(invitadosGuardados)
    resultado.total = invitados.length

    console.log(`Encontrados ${invitados.length} invitados en localStorage`)

    // Migrar cada invitado usando la API de importación (más eficiente)
    const invitadosParaImportar = invitados.map(inv => ({
      nombre: inv.nombre || '',
      apellido: inv.apellido || '',
      categoria: inv.categoria || 'General',
      confirmado: inv.confirmado || false
    }))

    // Usar la API de importación bulk
    const response = await invitadosAPI.import(invitadosParaImportar, 1)

    if (response.success && response.data) {
      resultado.exitosos = response.data.importados
      resultado.errores = response.data.errores || []
      resultado.migrados = invitados

      console.log(`Migrados ${resultado.exitosos} invitados correctamente`)

      if (response.data.duplicados > 0) {
        console.log(`${response.data.duplicados} invitados duplicados omitidos`)
      }
    }

  } catch (error) {
    console.error('Error al migrar invitados:', error)
    resultado.errores.push({
      tipo: 'general',
      mensaje: error.message
    })
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
    // Leer usuarios de localStorage
    const usuariosGuardados = localStorage.getItem('usuarios')

    if (!usuariosGuardados) {
      console.log('No hay usuarios en localStorage para migrar')
      return resultado
    }

    const usuarios = JSON.parse(usuariosGuardados)
    resultado.total = usuarios.length

    console.log(`Encontrados ${usuarios.length} usuarios en localStorage`)

    // Migrar cada usuario individualmente
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
          console.log(`Usuario migrado: ${usuario.email}`)
        }
      } catch (error) {
        console.error(`Error al migrar usuario ${usuario.email}:`, error)
        resultado.errores.push({
          usuario: usuario.email,
          mensaje: error.message
        })
      }
    }

  } catch (error) {
    console.error('Error al migrar usuarios:', error)
    resultado.errores.push({
      tipo: 'general',
      mensaje: error.message
    })
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

  console.log('Iniciando migracion de localStorage a Backend...')
  console.log('═'.repeat(50))

  const resultado = {
    invitados: null,
    usuarios: null,
    exito: false,
    timestamp: new Date().toISOString()
  }

  try {
    // Migrar invitados
    console.log('\nMIGRACION DE INVITADOS')
    console.log('─'.repeat(50))
    resultado.invitados = await migrarInvitados()

    // Migrar usuarios
    console.log('\nMIGRACION DE USUARIOS')
    console.log('─'.repeat(50))
    resultado.usuarios = await migrarUsuarios()

    // Verificar éxito general
    const invitadosOk = resultado.invitados.exitosos > 0 || resultado.invitados.total === 0
    const usuariosOk = resultado.usuarios.exitosos > 0 || resultado.usuarios.total === 0

    resultado.exito = invitadosOk && usuariosOk

    // Resumen
    console.log('\nRESUMEN DE MIGRACION')
    console.log('═'.repeat(50))
    console.log(`Invitados: ${resultado.invitados.exitosos}/${resultado.invitados.total} migrados`)
    console.log(`Usuarios: ${resultado.usuarios.exitosos}/${resultado.usuarios.total} migrados`)

    const totalErrores = resultado.invitados.errores.length + resultado.usuarios.errores.length
    console.log(`Errores totales: ${totalErrores}`)

    if (resultado.exito) {
      console.log('\nMigracion completada exitosamente')

      // Limpiar localStorage si se solicitó
      if (limpiarLocalStorage) {
        console.log('\nLimpiando localStorage...')
        localStorage.removeItem('invitados')
        localStorage.removeItem('usuarios')
        console.log('localStorage limpiado')
      }
    } else {
      console.log('\nMigracion completada con errores')
    }

  } catch (error) {
    console.error('\nError critico durante la migracion:', error)
    resultado.exito = false
    resultado.error = error.message
  }

  console.log('═'.repeat(50))
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

  const hayDatos = invitadosCount > 0 || usuariosCount > 0

  return {
    hayDatos,
    invitados: invitadosCount,
    usuarios: usuariosCount,
    total: invitadosCount + usuariosCount
  }
}

export default {
  migrateToBackend,
  checkMigrationData
}
