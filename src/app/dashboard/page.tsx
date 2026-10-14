import { auth } from "@/auth";
import prisma from '@/lib/prisma';
import { getEventsByOrganization } from '@/lib/queries/events';
import { notFound } from 'next/navigation';
import { redirect } from "next/navigation";
import { logoutUser } from "@/actions/auth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.organizationId) redirect("/login");

  // Obtener la organización completa para obtener el slug.
  const org = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
  });
  if (!org) notFound();

  // Listar eventos de la organización.
  const events = await getEventsByOrganization(org.id);

  return (
    <main className="p-8">
      <h1 className="text-2xl mb-4">
        Bienvenido, {session.user.name ?? "usuario"}! (org: {org.name})
      </h1>
      <nav className="mb-4">
        <a href={`/${org.slug}`} className="text-blue-600 hover:underline">
          Ver página pública de la organización
        </a>
      </nav>
      <section className="mb-6">
        <h2 className="text-xl mb-2">Eventos</h2>
        {events.length === 0 ? (
          <p>No hay eventos.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {events.map((e) => (
              <li key={e.id}>
                <a href={`/${org.slug}/eventos/${e.id}`} className="text-blue-600 hover:underline">
                  {e.title} – {new Date(e.date).toLocaleDateString()}
                </a>
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
