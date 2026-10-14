import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Exportamos el guardia que ejecuta el callback "authorized".
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/dashboard/:path*"],
};
