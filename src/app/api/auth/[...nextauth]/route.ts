import authHandler from "@/auth";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return authHandler(request);
}

export async function POST(request: NextRequest) {
  return authHandler(request);
}
