import { z } from 'zod';

export const createTicketSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  type: z.enum(['INCIDENT', 'SERVICE_REQUEST', 'PROBLEM']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  createdByUserId: z.string().min(1),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
