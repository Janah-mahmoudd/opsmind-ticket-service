import { Router } from "express";
import { prisma } from "../lib/prisma";
import { createTicketSchema } from "../validation/ticket.schema";
import { AppError } from "../errors/AppError";
import { publishTicketCreated } from "../events/publishers/ticket.publisher";

const router = Router();

/**
 * POST /tickets
 */
router.post("/", async (req, res, next) => {
  try {
    const parsed = createTicketSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError("Validation failed", 400);
    }

    const {
      title,
      description,
      type,
      priority,
      createdByUserId,
    } = parsed.data;

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

    // ✅ Emit event AFTER DB commit
    await publishTicketCreated(ticket);

    return res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /tickets
 */
router.get("/", async (_req, res, next) => {
  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: "desc" },
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
      return res.status(404).json({ error: "Ticket not found" });
    }

    return res.json(ticket);
  } catch (err) {
    next(err);
  }
});

export default router;
