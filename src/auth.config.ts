/**
 * Configuración mínima para Next‑Auth que se ejecuta en el *edge*.
 * Sólo contiene opciones que no requieren librerías de Node (prisma, bcrypt, …).
 */

import { auth as nextAuthMiddleware } from "next-auth/middleware";
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  // Página a la que redirige cuando se necesita autenticación
  pages: {
    signIn: "/login",
  },
  // Estrategia JWT (predeterminada para Credentials)
  session: { strategy: "jwt" },
};

// Exportamos la versión *middleware* que Next.js usará.
export const auth = nextAuthMiddleware(authConfig);
