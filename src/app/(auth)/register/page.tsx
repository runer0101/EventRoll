"use client";

import { useState, FormEvent } from "react";
import { registerUser } from "@/actions/auth";
import type { RegisterInput } from "@/lib/validations/auth";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: String(formData.get("name")),
      email: String(formData.get("email")),
      password: String(formData.get("password")),
      confirmPassword: String(formData.get("confirmPassword")),
    } as RegisterInput;
    const res = await registerUser(payload);
    if (!res.success) setError(res.error);
    else setSuccess(true);
  }

  return (
    <main className="flex flex-col items-center p-8">
      <h1 className="text-2xl mb-4">Registro</h1>
      {success ? (
        <p className="text-green-600">¡Registro completado! Ya puedes iniciar sesión.</p>
      ) : (
        <form className="w-full max-w-md space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium">Nombre</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              minLength={2}
              className="mt-1 block w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="mt-1 block w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirmar contraseña</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              className="mt-1 block w-full rounded border px-3 py-2"
            />
          </div>
          {error && <p className="text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full rounded bg-indigo-600 py-2 text-white hover:bg-indigo-700"
          >
            Registrarse
          </button>
        </form>
      )}
    </main>
  );
}
