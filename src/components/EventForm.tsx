"use client";

import { useRouter } from 'next/navigation';
import { FormEvent, useState, useTransition } from 'react';
import { createEvent, updateEvent } from '@/actions/events';

export interface EventFormValues {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  capacity: number;
}

interface EventFormProps {
  mode: 'create' | 'edit';
  initialValues?: EventFormValues;
}

/** Formats a Date for a `datetime-local` input using the local timezone. */
function toDateTimeLocal(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export default function EventForm({ mode, initialValues }: EventFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: initialValues?.title ?? '',
    description: initialValues?.description ?? '',
    date: initialValues ? toDateTimeLocal(initialValues.date) : '',
    location: initialValues?.location ?? '',
    capacity: initialValues ? String(initialValues.capacity) : '',
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
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
          ? await createEvent(form)
          : await updateEvent(initialValues!.id, form);

      if (result.success) {
        if (mode === 'create') {
          router.push('/dashboard');
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <p className="text-red-600">{errors.general.join(' ')}</p>
      )}
      {saved && <p className="text-green-600">Cambios guardados.</p>}

      <div>
        <label className="block font-medium" htmlFor="title">
          Título
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full rounded border p-2"
        />
        {fieldError('title')}
      </div>

      <div>
        <label className="block font-medium" htmlFor="description">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={form.description}
          onChange={handleChange}
          required
          className="w-full rounded border p-2"
        />
        {fieldError('description')}
      </div>

      <div>
        <label className="block font-medium" htmlFor="date">
          Fecha y hora
        </label>
        <input
          id="date"
          name="date"
          type="datetime-local"
          value={form.date}
          onChange={handleChange}
          required
          className="w-full rounded border p-2"
        />
        {fieldError('date')}
      </div>

      <div>
        <label className="block font-medium" htmlFor="location">
          Lugar
        </label>
        <input
          id="location"
          name="location"
          type="text"
          value={form.location}
          onChange={handleChange}
          required
          className="w-full rounded border p-2"
        />
        {fieldError('location')}
      </div>

      <div>
        <label className="block font-medium" htmlFor="capacity">
          Capacidad
        </label>
        <input
          id="capacity"
          name="capacity"
          type="number"
          min={1}
          value={form.capacity}
          onChange={handleChange}
          required
          className="w-full rounded border p-2"
        />
        {fieldError('capacity')}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending
          ? 'Guardando…'
          : mode === 'create'
            ? 'Crear evento'
            : 'Guardar cambios'}
      </button>
    </form>
  );
}
