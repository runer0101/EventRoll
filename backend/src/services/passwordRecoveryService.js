import bcrypt from 'bcryptjs'
import { passwordRecoveryRepository } from '../repositories/passwordRecoveryRepository.js'
import { enviarCodigoRecuperacion, generarCodigoVerificacion } from './emailService.js'
import { badRequest } from '../core/errors/AppError.js'
import { logger } from '../utils/logger.js'

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10

export const passwordRecoveryService = {
  async requestRecoveryCode(email) {
    if (!email) {
      throw badRequest('Email es requerido')
    }

    const usuario = await passwordRecoveryRepository.findUserByEmail(email)

    if (!usuario) {
      return {
        success: true,
        message: 'Si el email existe, recibirás un código de recuperación'
      }
    }

    const codigo = generarCodigoVerificacion()
    const expiraEn = new Date(Date.now() + 15 * 60 * 1000)

    await passwordRecoveryRepository.createRecoveryCode(usuario.id, codigo, expiraEn)

    const emailCliente = await passwordRecoveryRepository.getBackupClientEmail()

    try {
      await enviarCodigoRecuperacion(usuario.email, usuario.nombre, codigo, emailCliente)

      return {
        success: true,
        message: 'Código enviado. Revisa tu email.'
      }
    } catch (emailError) {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('[DEV] Código de recuperación generado. Configura EMAIL_USER y EMAIL_PASS en .env para enviar emails reales.')

        return {
          success: true,
          message: 'Código generado. Configura el email en .env para recibirlo.',
          warning: 'Email no configurado en desarrollo'
        }
      }

      throw new Error('Error al enviar email. Contacta al administrador.')
    }
  },

  async verifyRecoveryCode(email, codigo) {
    if (!email || !codigo) {
      throw badRequest('Email y código son requeridos')
    }

    const usuario = await passwordRecoveryRepository.findUserByEmail(email)

    if (!usuario) {
      throw badRequest('Código inválido o expirado')
    }

    const codeData = await passwordRecoveryRepository.findLatestRecoveryCodeForUser(usuario.id, codigo)

    if (!codeData) {
      throw badRequest('Código inválido')
    }

    if (codeData.usado) {
      throw badRequest('Este código ya fue utilizado')
    }

    if (new Date() > new Date(codeData.expira_en)) {
      throw badRequest('El código ha expirado. Solicita uno nuevo.')
    }

    return {
      success: true,
      message: 'Código verificado correctamente',
      token_recuperacion: codeData.id
    }
  },

  async resetPassword(email, codigo, nuevaPassword) {
    if (!email || !codigo || !nuevaPassword) {
      throw badRequest('Todos los campos son requeridos')
    }

    if (nuevaPassword.length < 8) {
      throw badRequest('La contraseña debe tener al menos 8 caracteres')
    }

    const client = await passwordRecoveryRepository.getClient()

    try {
      await client.query('BEGIN')

      const consumedCode = await passwordRecoveryRepository.consumeValidRecoveryCode(client, email, codigo)

      if (!consumedCode) {
        throw badRequest('Código inválido o expirado')
      }

      const nuevoHash = await bcrypt.hash(nuevaPassword, SALT_ROUNDS)

      await passwordRecoveryRepository.updateUserPassword(client, consumedCode.usuario_id, nuevoHash)
      await passwordRecoveryRepository.registerActivityWithClient(
        client,
        consumedCode.usuario_id,
        'Contraseña restablecida',
        { metodo: 'recuperacion_email', codigoId: consumedCode.id }
      )

      await client.query('COMMIT')

      return {
        success: true,
        message: 'Contraseña restablecida exitosamente'
      }
    } catch (error) {
      try {
        await client.query('ROLLBACK')
      } catch (rollbackError) {
        logger.error('Error haciendo rollback en restablecer-password', { message: rollbackError.message })
      }
      throw error
    } finally {
      client.release()
    }
  },

  async getBackupClientEmailConfig() {
    const email = await passwordRecoveryRepository.getBackupClientEmail()
    return {
      success: true,
      email: email || ''
    }
  },

  async updateBackupClientEmailConfig(email) {
    await passwordRecoveryRepository.upsertBackupClientEmail(email)

    return {
      success: true,
      message: 'Email del cliente actualizado'
    }
  }
}
