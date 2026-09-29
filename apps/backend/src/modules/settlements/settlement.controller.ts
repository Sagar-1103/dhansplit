import { settlementService } from "./settlement.service";

export class SettlementController {
  async create(req: Request, params: any, userId: string) {
    try {
      const settlement = await settlementService.createSettlement(userId!, (await req.json() as any));
      return Response.json({ success: true, data: settlement }, { status: 201 });
    } catch (err) {
      throw err;
    }
  }

  async list(req: Request, params: any, userId: string) {
    try {
      const settlements = await settlementService.listSettlements(userId!, new URL(req.url).searchParams.get("groupId") as string);
      return Response.json({ success: true, data: settlements });
    } catch (err) {
      throw err;
    }
  }

  async get(req: Request, params: any, userId: string) {
    try {
      const settlement = await settlementService.getSettlement(params.id as string, userId!);
      return Response.json({ success: true, data: settlement });
    } catch (err) {
      throw err;
    }
  }

  async delete(req: Request, params: any, userId: string) {
    try {
      await settlementService.deleteSettlement(params.id as string, userId!);
      return Response.json({ success: true, message: "Settlement deleted" });
    } catch (err) {
      throw err;
    }
  }
}

export const settlementController = new SettlementController();
