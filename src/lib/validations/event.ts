import { z } from 'zod';

export const EventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: 'El título debe tener al menos 3 caracteres' })
    .max(120, { message: 'El título es demasiado largo' }),
  description: z
    .string()
    .trim()
    .min(10, { message: 'La descripción debe tener al menos 10 caracteres' })
    .max(2000, { message: 'La descripción es demasiado larga' }),
  date: z.coerce.date({ invalid_type_error: 'La fecha es inválida' }),
  location: z
    .string()
    .trim()
    .min(3, { message: 'El lugar debe tener al menos 3 caracteres' })
    .max(200, { message: 'El lugar es demasiado largo' }),
  capacity: z.coerce
    .number({ invalid_type_error: 'La capacidad es obligatoria' })
    .int({ message: 'La capacidad debe ser un número entero' })
    .min(1, { message: 'La capacidad debe ser al menos 1' })
    .max(1_000_000, { message: 'La capacidad es demasiado grande' }),
});

export type EventInput = z.infer<typeof EventSchema>;
