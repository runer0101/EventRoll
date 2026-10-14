import prisma from '@/lib/prisma';

export const getOrganizationById = async (id: string) => {
  return prisma.organization.findUnique({ where: { id } });
};
