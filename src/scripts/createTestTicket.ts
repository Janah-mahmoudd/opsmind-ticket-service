import { prisma } from '../lib/prisma';

async function main() {
  const ticket = await prisma.ticket.create({
    data: {
      title: 'Test ticket',
      description: 'This is a test ticket from Prisma',
      type: 'INCIDENT',
      status: 'OPEN',
      priority: 'MEDIUM',
      createdByUserId: 'user-123',
    },
  });

  console.log(ticket);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
