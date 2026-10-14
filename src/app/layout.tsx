import React from "react";

export const metadata = {
  title: "EventRoll SaaS",
  description: "Plataforma multi‑tenant de gestión de eventos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head />
      <body className="bg-gray-50 antialiased">{children}</body>
    </html>
  );
}
