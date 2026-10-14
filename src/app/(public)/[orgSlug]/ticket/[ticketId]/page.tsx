import React from 'react';
import { notFound } from 'next/navigation';
import { getOrganizationBySlug } from '@/lib/organization';
import { getTicketByIdForOrganization } from '@/lib/queries/tickets';

export default async function TicketPage({
  params,
}: {
  params: Promise<{ orgSlug: string; ticketId: string }>;
}) {
  const { orgSlug, ticketId } = await params;
  const org = await getOrganizationBySlug(orgSlug);
  const ticket = await getTicketByIdForOrganization(ticketId, org.id);
  if (!ticket) notFound();

  return (
    <section className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">¡Registro exitoso!</h1>
      <p className="mb-2"><strong>Evento:</strong> {ticket.event?.title ?? 'Desconocido'}</p>
      <p className="mb-2"><strong>Tipo de ticket:</strong> {ticket.ticketType?.name ?? 'Desconocido'}</p>
      <p className="mb-4 text-xl font-mono bg-gray-100 p-2 rounded">
        <strong>QR Code:</strong> {ticket.qrCode}
      </p>
      <p className="text-sm text-gray-600">
        Guarda este código. Lo necesitarás para entrar al evento.
      </p>
    </section>
  );
}
