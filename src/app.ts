import express from "express";
import ticketRouter from "./routes/ticket.routes";
import { errorMiddleware } from "./middleware/error.middleware";
import { connectRabbitMQ } from "./lib/rabbitmq";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "ticket-service" });
});

app.use("/tickets", ticketRouter);

app.use(errorMiddleware);

async function bootstrap() {
  await connectRabbitMQ();
  return app;
}

export default bootstrap;
