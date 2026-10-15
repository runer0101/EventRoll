import { auth } from "@/auth";
import { getEventsByOrganization } from '@/lib/queries/events';
import { getTicketStatsByOrganization } from '@/lib/queries/tickets';
import { getOrganizationById } from '@/lib/queries/organizations';
import { getSubscription, isSubscriptionActive } from '@/lib/billing';
import UpgradeButton from '@/components/UpgradeButton';


import { notFound } from 'next/navigation';
import { redirect } from "next/navigation";
import { logoutUser } from "@/actions/auth";
import Link from 'next/link';


export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const session = await auth();
  if (!session?.user?.organizationId) redirect("/login");

  // Obtener la organización completa para obtener el slug.
  const org = await getOrganizationById(session.user.organizationId);

  if (!org) notFound();

  // Listar eventos de la organización.
  const events = await getEventsByOrganization(org.id);
  const ticketStats = await getTicketStatsByOrganization(org.id);
  const subscription = await getSubscription(org.id);
  const isPro = isSubscriptionActive(subscription);


  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl mb-4">
        Bienvenido, {session.user.name ?? "usuario"}! (org: {org.name})
      </h1>
      <nav className="mb-6 flex flex-wrap items-center gap-4 text-sm">
        <Link href={`/${org.slug}`} className="text-blue-600 hover:underline">
          Ver página pública de la organización
        </Link>
        <Link
          href="/dashboard/eventos/nuevo"
          className="rounded bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700"
        >
          Nuevo evento
        </Link>
      </nav>
      <section className="mb-6 rounded border bg-white p-4">
        <h2 className="text-xl mb-2">Plan</h2>
        {checkout === 'success' && (
          <p className="mb-2 text-green-600">
            Pago completado. Tu plan PRO se activará en unos segundos.
          </p>
        )}
        {checkout === 'cancelled' && (
          <p className="mb-2 text-gray-600">Checkout cancelado.</p>
        )}
        {isPro ? (
          <p>
            Plan <strong>PRO</strong> activo
            {subscription?.currentPeriodEnd
              ? ` hasta ${subscription.currentPeriodEnd.toLocaleDateString()}`
              : ''}
            .
          </p>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-gray-700">
              Plan <strong>FREE</strong>: 1 evento activo. Activa PRO para
              publicar eventos ilimitados.
            </p>
            <UpgradeButton />
          </div>
        )}
      </section>
      <section className="mb-6">
        <h2 className="text-xl mb-2">Eventos</h2>
        {events.length === 0 ? (
          <p>No hay eventos.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {events.map((e) => (
              <li key={e.id}>
                <Link href={`/dashboard/eventos/${e.id}`} className="text-blue-600 hover:underline">
                  {e.title}
                </Link>
                {" – "}
                {new Date(e.date).toLocaleDateString()}
                {" · "}
                <Link
                  href={`/${org.slug}/eventos/${e.id}`}
                  className="text-sm text-gray-600 hover:underline"
                >
                  página pública
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-6">
        <h2 className="text-xl mb-2">Tickets vendidos</h2>
        {ticketStats.length === 0 ? (
          <p>No hay tickets registrados.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {ticketStats.map((s) => (
              <li key={s.eventId}>
                {s.eventTitle} – Total: {s.total}, PAID: {s.paid}, PENDING: {s.pending}
              </li>
            ))}
          </ul>
        )}
      </section>

      <form action={logoutUser}>
        <button
          type="submit"
          className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
