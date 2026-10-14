import { z } from "zod";

/* ---------- Registro ---------- */
export const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Correo inválido" }),
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

/* ---------- Login ---------- */
export const LoginSchema = z.object({
  email: z.string().email({ message: "Correo inválido" }),
  password: z.string().min(1, { message: "La contraseña es obligatoria" }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
