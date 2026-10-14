import type { NextAuthConfig } from "next-auth";

// Configuración "liviana" que se utiliza en el middleware (entorno edge).
// No incluye Prisma ni bcrypt, pues esas librerías no están disponibles allí.
export const authConfig = {
  pages: { signIn: "/login" },
  providers: [], // se rellenará en src/auth.ts (servidor completo)
  callbacks: {
    // Autoriza el acceso solo cuando la sesión está presente para rutas protegidas.
    authorized({ auth, request }) {
      const isLogged = !!auth?.user;
      const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
      if (isDashboard) return isLogged; // redirige a /login si no está logueado
      return true; // resto de rutas públicas
    },
  },
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;
