import { z } from "zod";

export const convertCurrencySchema = z.object({
  from: z.string().length(3),
  to: z.string().length(3),
  amount: z.coerce.number().positive(),
});
