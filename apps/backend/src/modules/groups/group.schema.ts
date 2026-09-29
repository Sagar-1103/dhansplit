import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["HOME", "TRIP", "COUPLE", "OTHER"]).default("OTHER"),
  defaultCurrency: z.string().length(3).default("INR"),
  simplifyDebts: z.boolean().default(true),
  memberIds: z.array(z.string()).default([]),
});

export const updateGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(["HOME", "TRIP", "COUPLE", "OTHER"]).optional(),
  defaultCurrency: z.string().length(3).optional(),
  simplifyDebts: z.boolean().optional(),
  coverImageUrl: z.string().url().optional(),
});

export const addMembersSchema = z.object({
  userIds: z.array(z.string()).min(1),
});
