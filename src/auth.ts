import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { LoginSchema } from "@/lib/validations/auth";

// Tipo interno para los datos que devolvemos al crear la sesión
interface AuthUser {
  id: string;
  name: string;
  email: string;
  organizationId?: string | null;
}

// Exportamos las piezas que necesita el resto de la aplicación (handlers, auth, signIn, signOut).
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // Estrategia JWT obligatoria para Credentials
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validamos los datos antes de acceder a la base.
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null; // no revelamos si el email existe
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;
        // Buscamos el Member para obtener organizationId (primer vínculo).
        const member = await prisma.member.findFirst({ where: { userId: user.id } });
        const organizationId = member?.organizationId ?? null;
        const sessionUser: AuthUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          organizationId,
        };
        return sessionUser;
      },
    }),
  ],
  callbacks: {
    // Conservamos el callback "authorized" del config y añadimos los JWT y Session.
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        const u = user as AuthUser;
        token.id = u.id;
        if (u.organizationId) token.organizationId = u.organizationId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        if (token.organizationId) {
          session.user.organizationId = token.organizationId as string;
        }
      }
      return session;
    },
  },
});
