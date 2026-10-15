"use server";

import { RegisterSchema, LoginSchema, type RegisterInput, type LoginInput } from "@/lib/validations/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/auth";
// Removed import of AuthError because next-auth v5 does not export it directly.
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
    await prisma.$transaction(async (tx) => {
      // 1️⃣ Crear usuario
      const user = await tx.user.create({ data: { name, email, passwordHash } });

      // 2️⃣ Crear organización propia (slug único basado en el id del usuario)
      const organization = await tx.organization.create({
        data: {
          name: `Eventos de ${user.name}`,
          slug: `eventos-${user.id.slice(0, 8)}`,
        },
      });

      // 3️⃣ Vincular al usuario como ADMIN de la organización
      await tx.member.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: "ADMIN",
        },
      });
    });
    return { success: true };
  } catch (e) {
    // Si el email ya existía, Prisma lanza P2002 (unicidad).
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
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
  } catch {
    // Cualquier error en la autenticación se interpreta como credenciales inválidas.
    return { success: false, error: "Credenciales inválidas" };
  }
}

/** ---------- Logout ---------- */
export async function logoutUser(): Promise<void> {
  await signOut({ redirect: false, redirectTo: "/login" });
}
