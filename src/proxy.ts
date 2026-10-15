import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Proxy (formerly Middleware) runs before protected routes render.
// The exported function executes the "authorized" callback from authConfig.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/dashboard/:path*", "/checkin/:path*"],
};
