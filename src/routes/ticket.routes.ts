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
 * @openapi
 * /tickets:
 *   post:
 *     tags: [Tickets]
 *     summary: Create a ticket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, type, priority, createdByUserId]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [INCIDENT, SERVICE_REQUEST, PROBLEM]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *               createdByUserId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
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
 * @openapi
 * /tickets:
 *   get:
 *     tags: [Tickets]
 *     summary: List tickets
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *       - in: query
 *         name: assignedToUserId
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: OK
 */
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
 * @openapi
 * /tickets/{id}:
 *   get:
 *     tags: [Tickets]
 *     summary: Get ticket by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Ticket not found
 */
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
 * @openapi
 * /tickets/created-by/{createdByUserId}:
 *   get:
 *     tags: [Tickets]
 *     summary: Get tickets by createdByUserId
 *     parameters:
 *       - in: path
 *         name: createdByUserId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tickets created by the user
 */
router.get("/created-by/:createdByUserId", async (req, res, next) => {
  try {
    const { createdByUserId } = req.params;
    const tickets = await prisma.ticket.findMany({
      where: { createdByUserId },
      orderBy: { createdAt: "desc" },
    });
    return res.json(tickets);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /tickets/{id}:
 *   patch:
 *     tags: [Tickets]
 *     summary: Update a ticket
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [OPEN, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *               assignedToUserId:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Ticket not found
 */
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
 * @openapi
 * /tickets/{id}:
 *   delete:
 *     tags: [Tickets]
 *     summary: Delete a ticket
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted
 *       404:
 *         description: Ticket not found
 */
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
