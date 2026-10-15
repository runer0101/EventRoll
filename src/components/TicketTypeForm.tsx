"use client";

import { useRouter } from 'next/navigation';
import { FormEvent, useState, useTransition } from 'react';
import { createTicketType, updateTicketType } from '@/actions/ticket-types';

export interface TicketTypeFormValues {
  id: string;
  name: string;
  price: string;
  stock: number;
}

interface TicketTypeFormProps {
  eventId: string;
  mode: 'create' | 'edit';
  initialValues?: TicketTypeFormValues;
}

export default function TicketTypeForm({
  eventId,
  mode,
  initialValues,
}: TicketTypeFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initialValues?.name ?? '',
    price: initialValues?.price ?? '',
    stock: initialValues ? String(initialValues.stock) : '',
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSaved(false);
    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createTicketType(eventId, form)
          : await updateTicketType(initialValues!.id, form);

      if (result.success) {
        if (mode === 'create') {
          setForm({ name: '', price: '', stock: '' });
        } else {
          setSaved(true);
        }
        router.refresh();
        return;
      }
      if (result.errors) setErrors(result.errors);
      else if (result.error) setErrors({ general: [result.error] });
    });
  };

  const fieldError = (name: string) =>
    errors[name] && (
      <p className="text-sm text-red-600">{errors[name].join(' ')}</p>
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {errors.general && (
        <p className="text-red-600">{errors.general.join(' ')}</p>
      )}
      {saved && <p className="text-green-600">Cambios guardados.</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium" htmlFor={`name-${initialValues?.id ?? 'new'}`}>
            Nombre
          </label>
          <input
            id={`name-${initialValues?.id ?? 'new'}`}
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full rounded border p-2"
          />
          {fieldError('name')}
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor={`price-${initialValues?.id ?? 'new'}`}>
            Precio (USD)
          </label>
          <input
            id={`price-${initialValues?.id ?? 'new'}`}
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={handleChange}
            required
            className="w-full rounded border p-2"
          />
          {fieldError('price')}
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor={`stock-${initialValues?.id ?? 'new'}`}>
            Stock
          </label>
          <input
            id={`stock-${initialValues?.id ?? 'new'}`}
            name="stock"
            type="number"
            min={0}
            value={form.stock}
            onChange={handleChange}
            required
            className="w-full rounded border p-2"
          />
          {fieldError('stock')}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending
          ? 'Guardando…'
          : mode === 'create'
            ? 'Añadir tipo de entrada'
            : 'Guardar'}
      </button>
    </form>
  );
}
