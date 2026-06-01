/**
 * Mapa de permisos por rol — fuente única de verdad.
 *
 * Este módulo es compartido entre frontend (src/) y backend (backend/src/).
 * Cualquier cambio en permisos debe hacerse AQUÍ y propagarse automáticamente.
 *
 * Importar desde:
 *   Frontend:  import { PERMISOS_POR_ROL } from '../../shared/permissions.js'
 *   Backend:   import { PERMISOS_POR_ROL } from '../../../shared/permissions.js'
 */

export const PERMISOS_POR_ROL = Object.freeze({
  admin: Object.freeze({
    verInvitados: true,
    agregarInvitados: true,
    editarInvitados: true,
    eliminarInvitados: true,
    confirmarInvitados: true,
    exportarExcel: true,
    importarExcel: true,
    configurarSillas: true,
    verEstadisticas: true,
    gestionarUsuarios: true,
  }),
  organizador: Object.freeze({
    verInvitados: true,
    agregarInvitados: true,
    editarInvitados: true,
    eliminarInvitados: true,
    confirmarInvitados: true,
    exportarExcel: true,
    importarExcel: true,
    configurarSillas: true,
    verEstadisticas: true,
    gestionarUsuarios: false,
  }),
  asistente: Object.freeze({
    verInvitados: true,
    agregarInvitados: true,
    editarInvitados: true,
    eliminarInvitados: false,
    confirmarInvitados: true,
    exportarExcel: true,
    importarExcel: false,
    configurarSillas: false,
    verEstadisticas: true,
    gestionarUsuarios: false,
  }),
  visualizador: Object.freeze({
    verInvitados: true,
    agregarInvitados: false,
    editarInvitados: false,
    eliminarInvitados: false,
    confirmarInvitados: false,
    exportarExcel: true,
    importarExcel: false,
    configurarSillas: false,
    verEstadisticas: true,
    gestionarUsuarios: false,
  }),
  guardia: Object.freeze({
    verInvitados: true,
    agregarInvitados: false,
    editarInvitados: false,
    eliminarInvitados: false,
    confirmarInvitados: true,
    exportarExcel: false,
    importarExcel: false,
    configurarSillas: false,
    verEstadisticas: false,
    gestionarUsuarios: false,
  }),
})

export const ROLES = Object.keys(PERMISOS_POR_ROL)

export const CATEGORIAS_VALIDAS = Object.freeze(['General', 'VIP', 'Familia', 'Amigos', 'Trabajo'])
