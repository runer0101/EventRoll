import type { NextAuthConfig } from "next-auth";

// Lightweight NextAuth configuration used by the proxy.
// It intentionally avoids Prisma and bcrypt so no database client (or heavy
// dependency) is loaded on every request.
export const authConfig = {
  pages: { signIn: "/login" },
  providers: [], // filled in by src/auth.ts (full server-side setup)
  callbacks: {
    // Route protection: unauthenticated users are redirected to /login.
    authorized({ auth, request }) {
      const isLogged = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isProtected =
        pathname.startsWith("/dashboard") || pathname.startsWith("/checkin");
      return isProtected ? isLogged : true;
    },
  },
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;
