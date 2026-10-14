import React from 'react';
import { notFound } from 'next/navigation';
import { getOrganizationBySlug } from '@/lib/organization';
import { getEventForOrganization, getTicketTypesForEvent } from '@/lib/queries/events';

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ orgSlug: string; eventId: string }>;
}) {
  const { orgSlug, eventId } = await params;
  const org = await getOrganizationBySlug(orgSlug);
  if (!org) notFound();

  const event = await getEventForOrganization(eventId, org.id);
  if (!event) notFound();

  const ticketTypes = await getTicketTypesForEvent(event.id, org.id);

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">{event.title}</h1>
      <p>{event.description}</p>
      <p>Fecha: {new Date(event.date).toLocaleString()}</p>
      <p>Lugar: {event.location}</p>
      <h2 className="text-2xl mt-4">Tipos de entrada</h2>
      {ticketTypes.length === 0 ? (
        <p>No hay tipos de ticket.</p>
      ) : (
        <ul className="list-disc pl-5 space-y-2">
          {ticketTypes.map((tt) => (
            <li key={tt.id}>
              {tt.name} – ${tt.price} – {tt.stock} disponibles
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
