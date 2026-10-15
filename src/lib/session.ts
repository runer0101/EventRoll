import { auth } from '@/auth';

/**
 * Returns the organization id of the authenticated user, or null when there
 * is no session (or the user belongs to no organization).
 */
export async function getOrganizationId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.organizationId ?? null;
}
