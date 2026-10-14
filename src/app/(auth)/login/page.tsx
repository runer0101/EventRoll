"use client";

import { useState, FormEvent } from "react";
import { loginUser } from "@/actions/auth";
import type { LoginInput } from "@/lib/validations/auth";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const payload = {
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    } as LoginInput;
    const res = await loginUser(payload);
    if (!res.success) setError(res.error);
    else window.location.href = "/dashboard";
  }

  return (
    <main className="flex flex-col items-center p-8">
      <h1 className="text-2xl mb-4">Iniciar sesión</h1>
      <form className="w-full max-w-md space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 block w-full rounded border px-3 py-2"
          />
        </div>
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded bg-indigo-600 py-2 text-white hover:bg-indigo-700"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
