import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    // Añadimos id y organizationId al objeto session.user
    user: { id: string; organizationId?: string } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    organizationId?: string;
  }
}
