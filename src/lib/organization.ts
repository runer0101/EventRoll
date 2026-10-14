import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { cache } from 'react';

/**
 * Retrieve an Organization by its slug.
 * Uses React cache() to memoize the result per request.
 * If the organization does not exist, triggers a 404.
 */
export const getOrganizationBySlug = cache(async (slug: string) => {
  const org = await prisma.organization.findUnique({
    where: { slug },
  });
  if (!org) notFound();
  return org;
});
