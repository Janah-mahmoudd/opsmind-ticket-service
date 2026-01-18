import { getChannel } from "../../lib/rabbitmq";

export async function publishTicketCreated(ticket: any) {
  const channel = getChannel();

  const exchange = "ticket.events";
  const routingKey = "ticket.created";

  await channel.assertExchange(exchange, "topic", { durable: true });

  channel.publish(
    exchange,
    routingKey,
    Buffer.from(JSON.stringify({
      eventType: "ticket.created",
      occurredAt: new Date().toISOString(),
      data: ticket,
    })),
    { persistent: true }
  );

  console.log("📤 Event published: ticket.created");
}
