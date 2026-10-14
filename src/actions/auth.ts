"use server";

import { RegisterSchema, LoginSchema, type RegisterInput, type LoginInput } from "@/lib/validations/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn } from "next-auth/react";

type RegisterResult = { success: true } | { success: false; error: string };
type LoginResult = { success: true } | { success: false; error: string };

/** ---------- Registro ---------- */
export async function registerUser(data: RegisterInput): Promise<RegisterResult> {
  const parsed = RegisterSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Datos de registro inválidos" };
  }
  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "El correo ya está registrado" };
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { name, email, passwordHash } });
  return { success: true };
}

/** ---------- Login ---------- */
export async function loginUser(data: LoginInput): Promise<LoginResult> {
  const parsed = LoginSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Datos de login inválidos" };
  }
  const { email, password } = parsed.data;
  const result = await signIn("credentials", { redirect: false, email, password });
  if (result?.error) {
    return { success: false, error: "Credenciales inválidas" };
  }
  return { success: true };
}

/** ---------- Logout ---------- */
export async function logoutUser(): Promise<void> {
  "use server";
  const { signOut } = await import("next-auth/react");
  await signOut({ redirect: false });
}
