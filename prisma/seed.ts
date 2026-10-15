import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo@eventroll.dev';
const DEMO_PASSWORD = 'eventroll-demo';
const DEMO_CHECK_IN_CODE = 'DEMO-CHECKIN-0001';
const USED_CHECK_IN_CODE = 'DEMO-CHECKIN-0002';

/**
 * Recreates the demo organization content deterministically so that any
 * environment (local, CI, deployed demo) can be brought to a usable state
 * with `pnpm seed`.
 */
async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { passwordHash, name: 'Demo Organizer' },
    create: { name: 'Demo Organizer', email: DEMO_EMAIL, passwordHash },
  });

  const organization = await prisma.organization.upsert({
    where: { slug: 'demo' },
    update: { name: 'Demo Events Co.' },
    create: { name: 'Demo Events Co.', slug: 'demo' },
  });

  await prisma.member.upsert({
    where: {
      userId_organizationId: { userId: user.id, organizationId: organization.id },
    },
    update: { role: 'ADMIN' },
    create: { userId: user.id, organizationId: organization.id, role: 'ADMIN' },
  });

  // Deterministic event content: recreate the organization's events.
  await prisma.ticket.deleteMany({ where: { organizationId: organization.id } });
  await prisma.ticketType.deleteMany({ where: { organizationId: organization.id } });
  await prisma.event.deleteMany({ where: { organizationId: organization.id } });

  const event = await prisma.event.create({
    data: {
      title: 'Sunset Fest 2026',
      description:
        'Festival de música en vivo con bandas locales, food trucks y zona VIP.',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      location: 'Plaza Mayor, Ciudad Demo',
      capacity: 120,
      organizationId: organization.id,
    },
  });

  const general = await prisma.ticketType.create({
    data: {
      name: 'General',
      price: '25.50',
      stock: 100,
      eventId: event.id,
      organizationId: organization.id,
    },
  });

  const vip = await prisma.ticketType.create({
    data: {
      name: 'VIP',
      price: '79.00',
      stock: 20,
      eventId: event.id,
      organizationId: organization.id,
    },
  });

  await prisma.ticket.createMany({
    data: [
      {
        qrCode: DEMO_CHECK_IN_CODE,
        status: 'PAID',
        attendeeName: 'Lucía Fernández',
        attendeeEmail: 'lucia@example.com',
        ticketTypeId: general.id,
        eventId: event.id,
        organizationId: organization.id,
      },
      {
        qrCode: 'DEMO-TICKET-0003',
        status: 'PAID',
        attendeeName: 'Mateo Ríos',
        attendeeEmail: 'mateo@example.com',
        ticketTypeId: vip.id,
        eventId: event.id,
        organizationId: organization.id,
      },
      {
        qrCode: 'DEMO-TICKET-0004',
        status: 'PENDING',
        attendeeName: 'Sofía Torres',
        attendeeEmail: 'sofia@example.com',
        ticketTypeId: general.id,
        eventId: event.id,
        organizationId: organization.id,
      },
      {
        qrCode: USED_CHECK_IN_CODE,
        status: 'USED',
        checkedInAt: new Date(),
        attendeeName: 'Ana Vega',
        attendeeEmail: 'ana@example.com',
        ticketTypeId: general.id,
        eventId: event.id,
        organizationId: organization.id,
      },
    ],
  });

  console.log('Seed completed.');
  console.log(`  Organizer login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`  Public page:     /demo`);
  console.log(`  Event page:      /demo/eventos/${event.id}`);
  console.log(`  Check-in code:   ${DEMO_CHECK_IN_CODE} (valid)`);
  console.log(`  Check-in code:   ${USED_CHECK_IN_CODE} (already used)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
