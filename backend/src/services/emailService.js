import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import crypto from 'crypto'
import { logger } from '../utils/logger.js'

dotenv.config()

// Configurar el transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true para puerto 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

/**
 * Enviar código de recuperación de contraseña
 * @param {string} destinatario - Email del usuario
 * @param {string} nombreUsuario - Nombre del usuario
 * @param {string} codigo - Código de 8 dígitos
 * @param {string} emailCliente - Email adicional del cliente (opcional)
 */
export async function enviarCodigoRecuperacion(destinatario, nombreUsuario, codigo, emailCliente = null) {
  try {
    const htmlEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 36px;
      color: #1a1a1a;
      font-weight: 800;
      letter-spacing: 4px;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 16px;
      color: #1a1a1a;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
    }
    .message {
      font-size: 16px;
      color: #666;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .code-container {
      background-color: #f9f9f9;
      border: 3px dashed #FFD700;
      border-radius: 10px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
    }
    .code-label {
      font-size: 14px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }
    .code {
      font-size: 48px;
      font-weight: 800;
      color: #1a1a1a;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
    }
    .warning {
      background-color: #fff3cd;
      border-left: 4px solid #FFA500;
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .warning-title {
      font-weight: bold;
      color: #856404;
      margin-bottom: 5px;
    }
    .warning-text {
      font-size: 14px;
      color: #856404;
      margin: 0;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #eee;
    }
    .footer p {
      margin: 5px 0;
      font-size: 14px;
      color: #999;
    }
    .help-text {
      font-size: 14px;
      color: #999;
      margin-top: 20px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>EventRoll</h1>
      <p>Guest Management Platform</p>
    </div>

    <div class="content">
      <div class="greeting">
        Hola <strong>${nombreUsuario}</strong>,
      </div>

      <div class="message">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta.
        Usa el siguiente código de verificación para continuar con el proceso:
      </div>

      <div class="code-container">
        <div class="code-label">Tu código de verificación</div>
        <div class="code">${codigo}</div>
      </div>

      <div class="warning">
        <div class="warning-title">Importante:</div>
        <p class="warning-text">
          Este código es válido por <strong>15 minutos</strong>.
          Si no solicitaste este cambio, ignora este correo y tu contraseña permanecerá segura.
        </p>
      </div>

      <div class="message">
        Ingresa este código en la página de recuperación de contraseña para crear una nueva contraseña.
      </div>

      <div class="help-text">
        Si tienes problemas, contacta al administrador del sistema.
      </div>
    </div>

    <div class="footer">
      <p><strong>EventRoll - Guest Management Platform</strong></p>
      <p>Este es un correo automático, por favor no responder.</p>
      <p style="color: #ccc; font-size: 12px; margin-top: 15px;">
        © ${new Date().getFullYear()} EventRoll. Todos los derechos reservados.
      </p>
    </div>
  </div>
</body>
</html>
    `

    // El código se envía SOLO al usuario — nunca a terceros (admin/cliente)
    // Si el admin/cliente necesita saber de la solicitud, recibe una notificación
    // genérica sin el código, para no comprometer la cuenta del usuario.

    // Configurar el email al usuario (con el código)
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'EventRoll'}" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      // El asunto NO incluye el código (los servidores SMTP loguean subjects)
      subject: 'Solicitud de recuperación de contraseña - EventRoll',
      html: htmlEmail,
      text: `
EventRoll - Guest Management Platform

Hola ${nombreUsuario},

Recibimos una solicitud para restablecer la contraseña de tu cuenta.

TU CÓDIGO DE VERIFICACIÓN: ${codigo}

Este código es válido por 15 minutos.

Si no solicitaste este cambio, ignora este correo y tu contraseña permanecerá segura.

---
© ${new Date().getFullYear()} EventRoll. Todos los derechos reservados.
      `
    }

    // Enviar el email al usuario
    const info = await transporter.sendMail(mailOptions)

    // Notificación de auditoría al admin/cliente — SIN el código
    const emailAdminBackup = process.env.EMAIL_ADMIN_BACKUP || ''
    const notifyList = [
      ...(emailAdminBackup ? [emailAdminBackup] : []),
      ...(emailCliente && emailCliente !== emailAdminBackup ? [emailCliente] : []),
    ]

    if (notifyList.length > 0) {
      const notifOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'EventRoll'}" <${process.env.EMAIL_USER}>`,
        to: notifyList,
        subject: 'Aviso: solicitud de recuperación de contraseña',
        text: `Se solicitó recuperación de contraseña para la cuenta: ${destinatario}\nFecha: ${new Date().toISOString()}\n\n(Notificación automática — no contiene el código)`,
      }
      await transporter.sendMail(notifOptions).catch((e) =>
        logger.warn('No se pudo enviar notificación de auditoría de recovery', { message: e.message })
      )
    }

    if (process.env.NODE_ENV === 'development') {
      logger.debug('Email de recuperación enviado', { messageId: info.messageId })
    }

    return {
      success: true,
      messageId: info.messageId,
    }

  } catch (error) {
    logger.error('Error al enviar email de recuperación', { message: error.message })
    throw new Error('Error al enviar email de recuperación')
  }
}

/**
 * Verificar configuración de email
 */
export async function verificarConfiguracionEmail() {
  try {
    await transporter.verify()
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Configuración de email correcta')
    }
    return true
  } catch (error) {
    logger.error('Error en configuración de email', { message: error.message })
    return false
  }
}

/**
 * Generar código de 8 dígitos
 */
export function generarCodigoVerificacion() {
  // Usar crypto para generación criptográficamente segura
  return String(crypto.randomInt(10000000, 100000000))
}

export default {
  enviarCodigoRecuperacion,
  verificarConfiguracionEmail,
  generarCodigoVerificacion
}
