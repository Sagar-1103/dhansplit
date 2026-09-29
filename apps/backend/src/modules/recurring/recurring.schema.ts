import { z } from "zod";

const splitParticipant = z.object({
  userId: z.string(),
  amount: z.number().optional(),
  percentage: z.number().optional(),
  shares: z.number().int().optional(),
});

export const createRecurringSchema = z.object({
  description: z.string().min(1).max(200),
  amount: z.number().positive(),
  currency: z.string().length(3).default("INR"),
  category: z.string().default("general"),
  splitType: z.enum(["EQUAL", "EXACT", "PERCENTAGE", "SHARES"]).default("EQUAL"),
  frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "YEARLY"]),
  nextDueDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  groupId: z.string().optional(),
  participants: z.array(splitParticipant).min(1),
});

export const updateRecurringSchema = z.object({
  description: z.string().optional(),
  amount: z.number().positive().optional(),
  isActive: z.boolean().optional(),
  nextDueDate: z.string().datetime().optional(),
});
