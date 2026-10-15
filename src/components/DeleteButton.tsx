"use client";

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deleteEvent } from '@/actions/events';
import { deleteTicketType } from '@/actions/ticket-types';

interface DeleteButtonProps {
  kind: 'event' | 'ticketType';
  id: string;
  label?: string;
  confirmMessage?: string;
  redirectTo?: string;
}

export default function DeleteButton({
  kind,
  id,
  label = 'Eliminar',
  confirmMessage = '¿Seguro que quieres eliminarlo? Esta acción no se puede deshacer.',
  redirectTo,
}: DeleteButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!window.confirm(confirmMessage)) return;
    setError(null);
    startTransition(async () => {
      const result =
        kind === 'event' ? await deleteEvent(id) : await deleteTicketType(id);

      if (!result.success) {
        setError(result.error ?? 'No se pudo eliminar');
        return;
      }
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    });
  };

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded border border-red-600 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {isPending ? 'Eliminando…' : label}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  );
}
