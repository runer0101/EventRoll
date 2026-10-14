import React from 'react';
import { getOrganizationBySlug } from '@/lib/organization';
import { getEventsByOrganization } from '@/lib/queries/events';
import Link from 'next/link';


export default async function OrgLandingPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await getOrganizationBySlug(orgSlug);

  // Fetch upcoming events (optional, could be omitted for performance)
  const events = await getEventsByOrganization(org.id);

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">{org.name}</h1>
      <p>{org.slug /* you could add a description field later */}</p>
      <h2 className="text-2xl mt-4">Próximos eventos</h2>
      {events.length === 0 ? (
        <p>No hay eventos.</p>
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
