import { auth } from "@/auth.config";

export const config = {
  matcher: ["/dashboard/:path*"],
};

export default auth;
