import { auth } from '@/auth';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getOrganizationById } from '@/lib/queries/organizations';
import { getEventForOrganization, getTicketTypesForEvent } from '@/lib/queries/events';
import EventForm from '@/components/EventForm';
import TicketTypeForm from '@/components/TicketTypeForm';
import DeleteButton from '@/components/DeleteButton';

export default async function ManageEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const session = await auth();
  if (!session?.user?.organizationId) redirect('/login');

  const org = await getOrganizationById(session.user.organizationId);
  if (!org) notFound();

  const event = await getEventForOrganization(eventId, org.id);
  if (!event) notFound();

  const ticketTypes = await getTicketTypesForEvent(event.id, org.id);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
        ← Volver al dashboard
      </Link>

      <div className="mt-4 mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="text-sm text-gray-600">
            Gestiona los datos del evento y sus tipos de entrada.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 text-sm">
          <Link
            href={`/${org.slug}/eventos/${event.id}`}
            className="text-blue-600 hover:underline"
          >
            Ver página pública
          </Link>
          <Link
            href={`/checkin/${org.slug}/${event.id}`}
            className="text-blue-600 hover:underline"
          >
            Abrir check-in
          </Link>
          <DeleteButton
            kind="event"
            id={event.id}
            redirectTo="/dashboard"
            confirmMessage="¿Eliminar este evento? Solo es posible si no tiene tickets registrados."
          />
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-xl mb-3">Datos del evento</h2>
        <EventForm
          mode="edit"
          initialValues={{
            id: event.id,
            title: event.title,
            description: event.description,
            date: event.date,
            location: event.location,
            capacity: event.capacity,
          }}
        />
      </section>

      <section>
        <h2 className="text-xl mb-3">Tipos de entrada</h2>
        {ticketTypes.length === 0 ? (
          <p className="mb-4 text-gray-600">Aún no hay tipos de entrada.</p>
        ) : (
          <ul className="mb-6 space-y-3">
            {ticketTypes.map((tt) => (
              <li key={tt.id} className="rounded border bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{tt.name}</p>
                    <p className="text-sm text-gray-600">
                      ${tt.price.toFixed(2)} · {tt.stock} disponibles
                    </p>
                  </div>
                  <DeleteButton
                    kind="ticketType"
                    id={tt.id}
                    confirmMessage={`¿Eliminar el tipo de entrada "${tt.name}"? Solo es posible si no tiene tickets vendidos.`}
                  />
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-blue-600">
                    Editar
                  </summary>
                  <div className="mt-3">
                    <TicketTypeForm
                      eventId={event.id}
                      mode="edit"
                      initialValues={{
                        id: tt.id,
                        name: tt.name,
                        price: tt.price.toFixed(2),
                        stock: tt.stock,
                      }}
                    />
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}

        <div className="rounded border border-dashed p-4">
          <h3 className="mb-3 font-medium">Añadir tipo de entrada</h3>
          <TicketTypeForm eventId={event.id} mode="create" />
        </div>
      </section>
    </main>
  );
}
