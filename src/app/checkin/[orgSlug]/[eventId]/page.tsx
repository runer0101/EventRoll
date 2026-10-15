import { auth } from '@/auth';
import { notFound, redirect } from 'next/navigation';
import { getOrganizationBySlug } from '@/lib/organization';
import { getEventForOrganization } from '@/lib/queries/events';
import CheckInForm from '@/components/CheckInForm';

export default async function CheckInPage({
  params,
}: {
  params: Promise<{ orgSlug: string; eventId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { orgSlug, eventId } = await params;
  const org = await getOrganizationBySlug(orgSlug);

  // Verify the event belongs to the organization.
  const event = await getEventForOrganization(eventId, org.id);
  if (!event) notFound();

  // The requested organization must match the authenticated user's tenant.
  if (session.user.organizationId !== org.id) notFound();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Check-in — {event.title}</h1>
      <p className="text-gray-600">
        {new Date(event.date).toLocaleDateString()} · {event.location}
      </p>
      <CheckInForm eventId={event.id} />
    </main>
  );
}
