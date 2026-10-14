import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { logoutUser } from "@/actions/auth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main className="p-8">
      <h1 className="text-2xl mb-4">
        Bienvenido, {session.user.name ?? "usuario"}!
      </h1>
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
