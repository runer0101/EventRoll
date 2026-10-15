'use client';

import { useState, useTransition, FormEvent } from 'react';
import { checkInTicket } from '@/actions/checkin';

interface CheckInFormProps {
  eventId: string;
}

export default function CheckInForm({ eventId }: CheckInFormProps) {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await checkInTicket(code, eventId);
      if (result.success) {
        setMessage({
          type: 'success',
          text: `Check-in registrado para ${result.attendeeName}.`,
        });
        setCode('');
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border-t pt-6 mt-6">
      <h2 className="text-xl font-semibold">Validar ticket</h2>
      <div>
        <label className="block font-medium" htmlFor="qrCode">
          Código QR del ticket
        </label>
        <input
          type="text"
          id="qrCode"
          name="qrCode"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full rounded border p-2"
          placeholder="Escanea o pega el código"
          autoComplete="off"
          required
        />
      </div>
      {message && (
        <p
          className={
            message.type === 'success' ? 'text-green-600' : 'text-red-600'
          }
        >
          {message.text}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? 'Validando…' : 'Validar'}
      </button>
    </form>
  );
}
