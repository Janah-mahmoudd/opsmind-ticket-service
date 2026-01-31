import express from "express";
import cors from "cors";
import ticketRouter from "./routes/ticket.routes";
import { errorMiddleware } from "./middleware/error.middleware";
import { requestIdMiddleware } from "./middleware/requestId.middleware";
import { connectRabbitMQ, checkRabbitMQConnection } from "./lib/rabbitmq";
import { checkDatabaseConnection } from "./lib/prisma";
import { config } from "./config";
import { logger } from "./config/logger";
import { setupGracefulShutdown } from "./utils/gracefulShutdown";

export const app = express();

// Middleware
app.use(cors({ origin: config.cors.origins }));
app.use(express.json());
app.use(requestIdMiddleware);

// Health check (basic)
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "ticket-service" });
});

// Health check (deep - checks dependencies)
app.get("/health/ready", async (_req, res) => {
  const dbOk = await checkDatabaseConnection();
  const rabbitOk = await checkRabbitMQConnection();

  const allOk = dbOk && rabbitOk;

  res.status(allOk ? 200 : 503).json({
    status: allOk ? "ready" : "degraded",
    service: "ticket-service",
    checks: {
      database: dbOk ? "ok" : "fail",
      rabbitmq: rabbitOk ? "ok" : "fail",
    },
  });
});

// Routes
app.use("/tickets", ticketRouter);

// Error handler (must be last)
app.use(errorMiddleware);

async function bootstrap() {
  setupGracefulShutdown();

  try {
    await connectRabbitMQ();
  } catch (error) {
    logger.warn("RabbitMQ not available at startup, will retry in background");
  }

  return app;
}

export default bootstrap;
