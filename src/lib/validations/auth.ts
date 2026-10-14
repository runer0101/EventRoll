import { z } from "zod";

// Normalizamos correos: sin espacios y en minúsculas.
const emailSchema = z.string().trim().toLowerCase().email({ message: "Correo inválido" });

/* ---------- Registro ---------- */
export const RegisterSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  email: emailSchema,
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .max(72, { message: "Máximo 72 caracteres" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

/* ---------- Login ---------- */
export const LoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "La contraseña es obligatoria" }).max(72, { message: "Máximo 72 caracteres" }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
