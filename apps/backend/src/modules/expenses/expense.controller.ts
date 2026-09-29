import { expenseService } from "./expense.service";

export class ExpenseController {
  async create(req: Request, params: any, userId: string) {
    try {
      const expense = await expenseService.createExpense(userId!, (await req.json() as any));
      return Response.json({ success: true, data: expense }, { status: 201 });
    } catch (err) {
      throw err;
    }
  }

  async get(req: Request, params: any, userId: string) {
    try {
      const expense = await expenseService.getExpense(params.id as string, userId!);
      return Response.json({ success: true, data: expense });
    } catch (err) {
      throw err;
    }
  }

  async list(req: Request, params: any, userId: string) {
    try {
      const result = await expenseService.listExpenses(userId!, Object.fromEntries(new URL(req.url).searchParams.entries()) as any);
      return Response.json({ success: true, ...result });
    } catch (err) {
      throw err;
    }
  }

  async update(req: Request, params: any, userId: string) {
    try {
      const expense = await expenseService.updateExpense(params.id as string, userId!, (await req.json() as any));
      return Response.json({ success: true, data: expense });
    } catch (err) {
      throw err;
    }
  }

  async delete(req: Request, params: any, userId: string) {
    try {
      await expenseService.deleteExpense(params.id as string, userId!);
      return Response.json({ success: true, message: "Expense deleted" });
    } catch (err) {
      throw err;
    }
  }
}

export const expenseController = new ExpenseController();
