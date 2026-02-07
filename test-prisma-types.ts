import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test() {
  // Test creating a ticket with new schema
  const ticket = await prisma.ticket.create({
    data: {
      title: "Test",
      description: "Test description",
      requester_id: "user-123",
      assigned_to_level: "L1",
      priority: "MEDIUM",
      support_level: "L1",
      status: "OPEN",
      building: "Building A",
      room: "101",
      escalation_count: 0,
      is_deleted: false,
    },
  });

  // Test finding with new schema
  const found = await prisma.ticket.findFirst({
    where: {
      id: ticket.id,
      is_deleted: false,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  // Test escalation
  await prisma.ticketEscalation.create({
    data: {
      ticket_id: ticket.id,
      from_level: "L1",
      to_level: "L2",
      reason: "Test escalation",
    },
  });

  console.log("All tests passed!", ticket, found);
}

test();
