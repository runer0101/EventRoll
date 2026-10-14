import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    // Añadimos el id de usuario al objeto session.user
    user: { id: string } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}
