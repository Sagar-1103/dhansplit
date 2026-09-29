import { prisma } from "@repo/db";
import { convertCurrency } from "../../utils/currencyConverter";
import { ForbiddenError } from "../../lib/errors";

export class CurrencyService {
  async listSupportedCurrencies() {
    return prisma.currency.findMany({ orderBy: { code: "asc" } });
  }

  async convert(userId: string, from: string, to: string, amount: number) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { isPro: true } });
    if (!user?.isPro) {
      throw new ForbiddenError("Currency conversion is a Pro feature.");
    }

    return convertCurrency(from.toUpperCase(), to.toUpperCase(), amount);
  }
}

export const currencyService = new CurrencyService();
