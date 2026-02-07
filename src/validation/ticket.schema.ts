import { z } from "zod";

const SupportLevelEnum = z.enum(["L1", "L2", "L3", "L4"]);
const TicketPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);
const TicketStatusEnum = z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]);

export const createTicketSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  building: z.string().min(1, "Building is required"),
  room: z.string().min(1, "Room is required"),
  requester_id: z.string().uuid("requester_id must be a valid UUID"),
});

export const updateTicketSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  description: z.string().min(5, "Description must be at least 5 characters").optional(),
  building: z.string().min(1, "Building is required").optional(),
  room: z.string().min(1, "Room is required").optional(),
  status: TicketStatusEnum.optional(),
  resolution_summary: z.string().optional(),
});

export const escalateTicketSchema = z.object({
  from_level: SupportLevelEnum,
  to_level: SupportLevelEnum,
  reason: z.string().min(1, "Reason is required"),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type EscalateTicketInput = z.infer<typeof escalateTicketSchema>;
