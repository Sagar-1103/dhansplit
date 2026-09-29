import { prisma } from "@repo/db";
import { ForbiddenError, NotFoundError } from "../../lib/errors";
import type { Frequency, SplitType } from "@repo/db";

export class RecurringService {
  async create(userId: string, data: any) {
    if (data.groupId) {
      const member = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId: data.groupId, userId } },
      });
      if (!member) throw new ForbiddenError("Not a group member");
    }

    return prisma.recurringExpense.create({
      data: {
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        category: data.category,
        splitType: data.splitType,
        frequency: data.frequency,
        nextDueDate: new Date(data.nextDueDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        paidById: userId,
        groupId: data.groupId,
        splitConfig: data.participants,
      },
    });
  }

  async list(userId: string) {
    return prisma.recurringExpense.findMany({
      where: {
        OR: [
          { paidById: userId },
          // A real implementation would also check if the user is in the splitConfig JSON.
        ],
      },
      orderBy: { nextDueDate: "asc" },
    });
  }

  async update(id: string, userId: string, data: any) {
    const existing = await prisma.recurringExpense.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Recurring expense not found");
    if (existing.paidById !== userId) throw new ForbiddenError("Only payer can update");

    return prisma.recurringExpense.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string) {
    const existing = await prisma.recurringExpense.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Recurring expense not found");
    if (existing.paidById !== userId) throw new ForbiddenError("Only payer can delete");

    await prisma.recurringExpense.delete({ where: { id } });
  }
}

export const recurringService = new RecurringService();
