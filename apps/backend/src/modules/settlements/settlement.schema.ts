import { z } from "zod";

export const createSettlementSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3).default("INR"),
  method: z.enum(["CASH", "BANK_TRANSFER", "UPI", "PAYPAL", "VENMO", "OTHER"]).default("CASH"),
  notes: z.string().optional(),
  payeeId: z.string(),
  groupId: z.string().optional(),
});
