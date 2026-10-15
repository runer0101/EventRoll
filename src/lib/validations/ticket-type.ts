import { z } from 'zod';

export const TicketTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(80, { message: 'El nombre es demasiado largo' }),
  price: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, {
      message: 'Precio inválido (usa hasta 2 decimales, ej. 25.50)',
    }),
  stock: z.coerce
    .number({ invalid_type_error: 'El stock es obligatorio' })
    .int({ message: 'El stock debe ser un número entero' })
    .min(0, { message: 'El stock no puede ser negativo' })
    .max(1_000_000, { message: 'El stock es demasiado grande' }),
});

export type TicketTypeInput = z.infer<typeof TicketTypeSchema>;
