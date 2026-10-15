import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import EventForm from '@/components/EventForm';

export default async function NewEventPage() {
  const session = await auth();
  if (!session?.user?.organizationId) redirect('/login');

  return (
    <main className="mx-auto max-w-2xl p-8">
      <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
        ← Volver al dashboard
      </Link>
      <h1 className="text-2xl font-bold mt-4 mb-6">Nuevo evento</h1>
      <EventForm mode="create" />
    </main>
  );
}
