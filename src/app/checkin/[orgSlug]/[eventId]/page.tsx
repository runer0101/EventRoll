import React from 'react';
import { notFound } from 'next/navigation';
import { getOrganizationBySlug } from '@/lib/organization';
import { getEventForOrganization } from '@/lib/queries/events';

export default async function CheckInPage({
  params,
}: {
  params: Promise<{ orgSlug: string; eventId: string }>;
}) {
  const { orgSlug, eventId } = await params;
  const org = await getOrganizationBySlug(orgSlug);

  // Verify the event belongs to the organization.
  const event = await getEventForOrganization(eventId, org.id);
  if (!event) notFound();

  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold">Check‑in para {event.title}</h1>
      <p>Esta página es un placeholder.
        <br />
        • NO lee cámara.
        <br />
        • NO valida QR.
        <br />
        • NO actualiza Ticket.status.
        <br />
        Próximamente se implementará la lógica de check‑in.
      </p>
    </section>
  );
}
