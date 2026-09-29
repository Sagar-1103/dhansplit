import { z } from "zod";

const splitParticipant = z.object({
  userId: z.string(),
  amount: z.number().optional(),      // EXACT
  percentage: z.number().optional(),   // PERCENTAGE
  shares: z.number().int().optional(), // SHARES
});

export const createExpenseSchema = z.object({
  description: z.string().min(1).max(200),
  amount: z.number().positive(),
  currency: z.string().length(3).default("INR"),
  category: z.string().default("general"),
  date: z.string().datetime().optional(),
  notes: z.string().optional(),
  splitType: z.enum(["EQUAL", "EXACT", "PERCENTAGE", "SHARES"]).default("EQUAL"),
  groupId: z.string().optional(),
  participants: z.array(splitParticipant).min(1),
});

export const updateExpenseSchema = z.object({
  description: z.string().min(1).max(200).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  category: z.string().optional(),
  date: z.string().datetime().optional(),
  notes: z.string().optional(),
  splitType: z.enum(["EQUAL", "EXACT", "PERCENTAGE", "SHARES"]).optional(),
  participants: z.array(splitParticipant).min(1).optional(),
});

export const listExpensesSchema = z.object({
  groupId: z.string().optional(),
  category: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().default(20),
});
