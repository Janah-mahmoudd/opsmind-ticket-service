import { Router } from "express";
import { prisma } from "../lib/prisma";
import {
  createTicketSchema,
  updateTicketSchema,
  CreateTicketInput,
  UpdateTicketInput,
} from "../validation/ticket.schema";
import { AppError } from "../errors/AppError";
import { publishTicketCreated, publishTicketUpdated } from "../events/publishers/ticket.publisher";
import { validate } from "../middleware/validate.middleware";

const router = Router();

/**
 * POST /tickets
 */
router.post("/", validate(createTicketSchema), async (req, res, next) => {
  try {
    const { title, description, type, priority, createdByUserId } =
      req.body as CreateTicketInput;

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        type,
        priority,
        status: "OPEN",
        createdByUserId,
      },
    });

    // Emit event AFTER DB commit
    await publishTicketCreated(ticket);

    return res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /tickets
 */
router.get("/", async (req, res, next) => {
  try {
    const { status, priority, assignedToUserId, limit, offset } = req.query;

    const tickets = await prisma.ticket.findMany({
      where: {
        ...(typeof status === "string" && { status: status as "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" }),
        ...(typeof priority === "string" && { priority: priority as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" }),
        ...(typeof assignedToUserId === "string" && { assignedToUserId }),
      },
      orderBy: { createdAt: "desc" },
      take: typeof limit === "string" ? parseInt(limit, 10) : 50,
      skip: typeof offset === "string" ? parseInt(offset, 10) : 0,
    });

    return res.json(tickets);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /tickets/:id
 */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new AppError("Ticket not found", 404);
    }

    return res.json(ticket);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /tickets/:id
 */
router.patch("/:id", validate(updateTicketSchema), async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const updateData = req.body as UpdateTicketInput;

    // Check if ticket exists
    const existing = await prisma.ticket.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Ticket not found", 404);
    }

    // Handle status transitions
    const data: any = { ...updateData };

    if (updateData.status === "RESOLVED" && existing.status !== "RESOLVED") {
      data.resolvedAt = new Date();
    }
    if (updateData.status === "CLOSED" && existing.status !== "CLOSED") {
      data.closedAt = new Date();
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data,
    });

    await publishTicketUpdated(ticket);

    return res.json(ticket);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /tickets/:id
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.ticket.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Ticket not found", 404);
    }

    await prisma.ticket.delete({ where: { id } });

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
