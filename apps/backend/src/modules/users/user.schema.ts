import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  defaultCurrency: z.string().length(3).optional(),
});

export const searchUsersSchema = z.object({
  q: z.string().min(1, "Search query required"),
});
