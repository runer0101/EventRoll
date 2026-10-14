"use server";

import { RegisterSchema, LoginSchema, type RegisterInput, type LoginInput } from "@/lib/validations/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { Prisma } from "@prisma/client";

type RegisterResult = { success: true } | { success: false; error: string };
type LoginResult = { success: true } | { success: false; error: string };

/** ---------- Registro ---------- */
export async function registerUser(data: RegisterInput): Promise<RegisterResult> {
  const parsed = RegisterSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Datos de registro inválidos" };
  }
  const { name, email, password } = parsed.data;

  // Hash de contraseña con factor de coste 12.
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await prisma.user.create({ data: { name, email, passwordHash } });
    return { success: true };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      // Violación de unicidad del email.
      return { success: false, error: "El correo ya está registrado" };
    }
    throw e; // Otros errores reales deben propagarse.
  }
}

/** ---------- Login ---------- */
export async function loginUser(data: LoginInput): Promise<LoginResult> {
  const parsed = LoginSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Datos de login inválidos" };
  }
  const { email, password } = parsed.data;
  try {
    await signIn("credentials", { ...{ email, password }, redirect: false });
    return { success: true };
  } catch (e) {
    if (e instanceof AuthError) {
      return { success: false, error: "Credenciales inválidas" };
    }
    throw e;
  }
}

/** ---------- Logout ---------- */
export async function logoutUser(): Promise<void> {
  await signOut({ redirect: false, redirectTo: "/login" });
}
