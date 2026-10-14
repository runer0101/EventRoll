import React from 'react';
import { getOrganizationBySlug } from '@/lib/organization';
import { getEventsByOrganization } from '@/lib/queries/events';
import Link from 'next/link';


export default async function OrgEventsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await getOrganizationBySlug(orgSlug);

  const events = await getEventsByOrganization(org.id);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Eventos de {org.name}</h1>
      {events.length === 0 ? (
        <p>No hay eventos programados.</p>
      ) : (
        <ul className="list-disc pl-5 space-y-2">
          {events.map((e) => (
            <li key={e.id}>
              <Link href={`/${org.slug}/eventos/${e.id}`} className="text-blue-600 hover:underline">
                {e.title} – {new Date(e.date).toLocaleDateString()}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
