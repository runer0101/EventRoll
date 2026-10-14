import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { RegisterInput } from "@/lib/validations/auth";

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
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.trim().toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null; // no revelamos si el email existe
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;
        return { id: user.id, name: user.name, email: user.email } as RegisterInput;
      },
    }),
  ],
  callbacks: {
    // Conservamos el callback "authorized" del config y añadimos los JWT y Session.
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) token.id = (user as any).id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
});
