import { z } from 'zod';

/**
 * Schema for attendee registration input.
 * - name: 2‑100 characters.
 * - email: trimmed, lower‑cased, valid email format.
 * - ticketTypeId: non‑empty string (UUID).
 */
export const AttendeeSchema = z.object({
  name: z.string().min(2, { message: 'El nombre es muy corto' }).max(100, { message: 'El nombre es muy largo' }).trim(),
  email: z.string().trim().toLowerCase().email({ message: 'Correo electrónico no válido' }).max(200),
  ticketTypeId: z.string().min(1, { message: 'Tipo de ticket requerido' }).trim(),
});

export type AttendeeInput = z.infer<typeof AttendeeSchema>;
