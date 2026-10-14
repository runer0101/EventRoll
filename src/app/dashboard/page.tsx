import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { logoutUser } from "@/actions/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    // Por seguridad, aunque el middleware redirige, retornamos null.
    return null;
  }

  async function handleLogout() {
    "use server";
    await logoutUser();
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl mb-4">
        Bienvenido, {session.user.name ?? "usuario"}!
      </h1>
      <form action={handleLogout}>
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
