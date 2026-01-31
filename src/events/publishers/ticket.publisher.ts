import { getChannel, EXCHANGE_NAME } from "../../lib/rabbitmq";
import { logger } from "../../config/logger";
import { Ticket } from "@prisma/client";

export async function publishTicketCreated(ticket: Ticket): Promise<void> {
  const channel = getChannel();
  const routingKey = "ticket.created";

  const message = {
    eventType: "ticket.created",
    occurredAt: new Date().toISOString(),
    data: ticket,
  };

  channel.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  );

  logger.info("Event published: ticket.created", { ticketId: ticket.id });
}

export async function publishTicketUpdated(ticket: Ticket): Promise<void> {
  const channel = getChannel();
  const routingKey = "ticket.updated";

  const message = {
    eventType: "ticket.updated",
    occurredAt: new Date().toISOString(),
    data: ticket,
  };

  channel.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  );

  logger.info("Event published: ticket.updated", { ticketId: ticket.id });
}
