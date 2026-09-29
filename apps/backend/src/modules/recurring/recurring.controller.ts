import { recurringService } from "./recurring.service";

export class RecurringController {
  async create(req: Request, params: any, userId: string) {
    try {
      const result = await recurringService.create(userId!, (await req.json() as any));
      return Response.json({ success: true, data: result }, { status: 201 });
    } catch (err) {
      throw err;
    }
  }

  async list(req: Request, params: any, userId: string) {
    try {
      const result = await recurringService.list(userId!);
      return Response.json({ success: true, data: result });
    } catch (err) {
      throw err;
    }
  }

  async update(req: Request, params: any, userId: string) {
    try {
      const result = await recurringService.update(params.id as string, userId!, (await req.json() as any));
      return Response.json({ success: true, data: result });
    } catch (err) {
      throw err;
    }
  }

  async delete(req: Request, params: any, userId: string) {
    try {
      await recurringService.delete(params.id as string, userId!);
      return Response.json({ success: true, message: "Deleted successfully" });
    } catch (err) {
      throw err;
    }
  }
}

export const recurringController = new RecurringController();
