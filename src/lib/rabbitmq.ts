import { connect } from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL ?? "amqp://opsmind:opsmind@localhost:5672";

let connection: any = null;
let channel: any = null;

export async function connectRabbitMQ(): Promise<void> {
  if (connection && channel) {
    return;
  }

  const conn = await connect(RABBITMQ_URL);
  connection = conn;
  channel = await conn.createChannel();

  console.log("🐇 RabbitMQ connected");
}

/**
 * Get active channel (used by publishers)
 */
export function getChannel() {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }

  return channel;
}