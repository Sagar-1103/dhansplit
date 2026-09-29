import { balanceService } from "./balance.service";

export class BalanceController {
  async getOverall(req: Request, params: any, userId: string) {
    try {
      const balances = await balanceService.getOverallBalances(userId!);
      return Response.json({ success: true, data: balances });
    } catch (err) {
      throw err;
    }
  }

  async getTotal(req: Request, params: any, userId: string) {
    try {
      const total = await balanceService.getTotalBalance(userId!);
      return Response.json({ success: true, data: total });
    } catch (err) {
      throw err;
    }
  }

  async getGroupBalances(req: Request, params: any, userId: string) {
    try {
      const balances = await balanceService.getGroupBalances(params.groupId as string, userId!);
      return Response.json({ success: true, data: balances });
    } catch (err) {
      throw err;
    }
  }

  async getSimplified(req: Request, params: any, userId: string) {
    try {
      const debts = await balanceService.getSimplifiedDebts(params.groupId as string, userId!);
      return Response.json({ success: true, data: debts });
    } catch (err) {
      throw err;
    }
  }
}

export const balanceController = new BalanceController();
