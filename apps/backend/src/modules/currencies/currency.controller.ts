import { currencyService } from "./currency.service";

export class CurrencyController {
  async list(req: Request, params: any, userId: string) {
    try {
      const currencies = await currencyService.listSupportedCurrencies();
      return Response.json({ success: true, data: currencies });
    } catch (err) {
      throw err;
    }
  }

  async convert(req: Request, params: any, userId: string) {
    try {
      const { from, to, amount } = Object.fromEntries(new URL(req.url).searchParams.entries()) as any;
      const result = await currencyService.convert(userId!, from, to, Number(amount));
      return Response.json({ success: true, data: result });
    } catch (err) {
      throw err;
    }
  }
}

export const currencyController = new CurrencyController();
