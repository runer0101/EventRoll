import React from 'react';
import type { ReactNode } from 'react';
import { getOrganizationBySlug } from '@/lib/organization';
import { notFound } from 'next/navigation';

export default async function OrgLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await getOrganizationBySlug(orgSlug);
  if (!org) notFound(); // safety, getOrganizationBySlug already 404s

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">{org.name}</h1>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
