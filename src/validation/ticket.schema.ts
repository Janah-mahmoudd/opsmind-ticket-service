import { z } from "zod";

export const createTicketSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  type: z.enum(["INCIDENT", "SERVICE_REQUEST", "PROBLEM"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  createdByUserId: z.string().min(1, "createdByUserId is required"),
});

export const updateTicketSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  description: z.string().min(5, "Description must be at least 5 characters").optional(),
  type: z.enum(["INCIDENT", "SERVICE_REQUEST", "PROBLEM"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  status: z.enum(["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  assignedToUserId: z.string().nullable().optional(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
