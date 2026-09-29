import { z } from "zod";

export const sendRequestSchema = z.object({
  email: z.string().email().optional(),
  userId: z.string().optional(),
}).refine((d) => d.email || d.userId, { message: "Provide email or userId" });

export const friendIdSchema = z.object({
  id: z.string(),
});
