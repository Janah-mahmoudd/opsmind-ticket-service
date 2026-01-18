import amqp, { Connection, Channel } from "amqplib";

const RABBITMQ_URL = "amqp://opsmind:opsmind@localhost:5672";

let connection: Connection | null = null;
let channel: Channel | null = null;

/**
 * Connect to RabbitMQ (called once at app startup)
 */
export async function connectRabbitMQ(): Promise<void> {
  if (connection && channel) {
    return;
  }

  connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();

  console.log("🐇 RabbitMQ connected");
}

/**
 * Get active channel (used by publishers)
 */
export function getChannel(): Channel {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }

  return channel;
}
