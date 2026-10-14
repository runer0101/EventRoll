"use client";

import { useState, useTransition, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { registerAttendee } from '@/actions/register';
import type { TicketType } from '@prisma/client';

interface AttendeeFormProps {
  ticketTypes: TicketType[];
  orgSlug: string;
  eventId: string;
}

export default function AttendeeForm({ ticketTypes, orgSlug, eventId }: AttendeeFormProps) {
  const [form, setForm] = useState({ name: '', email: '', ticketTypeId: '' });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    startTransition(async () => {
      // server action expects the raw data object
      const result = await registerAttendee(form, orgSlug, eventId);
      if (result.success) {
        router.push(`/${orgSlug}/ticket/${result.ticketId}`);
      } else {
        if (result.errors) setErrors(result.errors);
        else if (result.error) setErrors({ general: [result.error] });
      }
    });
  };

  const selectedTicket = ticketTypes.find((t) => t.id === form.ticketTypeId);
  const outOfStock = selectedTicket ? selectedTicket.stock <= 0 : false;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border-t pt-6 mt-6">
      <h2 className="text-xl font-semibold">Registro de asistente</h2>
      {errors.general && (
        <p className="text-red-600">{errors.general.join(' ')}</p>
      )}
      <div>
        <label className="block font-medium" htmlFor="name">
          Nombre
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full rounded border p-2"
          required
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.join(' ')}</p>
        )}
      </div>
      <div>
        <label className="block font-medium" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full rounded border p-2"
          required
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.join(' ')}</p>
        )}
      </div>
      <div>
        <label className="block font-medium" htmlFor="ticketTypeId">
          Tipo de ticket
        </label>
        <select
          id="ticketTypeId"
          name="ticketTypeId"
          value={form.ticketTypeId}
          onChange={handleChange}
          className="w-full rounded border p-2"
          required
        >
          <option value="">Seleccione una opción</option>
          {ticketTypes.map((tt) => (
            <option key={tt.id} value={tt.id} disabled={tt.stock <= 0}>
              {tt.name} – ${tt.price} ({tt.stock} disponible{tt.stock !== 1 ? 's' : ''})
            </option>
          ))}
        </select>
        {errors.ticketTypeId && (
          <p className="text-sm text-red-600">{errors.ticketTypeId.join(' ')}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isPending || outOfStock}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? 'Registrando…' : 'Registrarse'}
      </button>
    </form>
  );
}
