import { prisma } from "@repo/db";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../lib/errors";
import { calculateSplits } from "../../utils/splitCalculator";

import type { SplitType } from "@repo/db";

export class ExpenseService {
  // create expense + calculate splits + log activity
  async createExpense(userId: string, data: {
    description: string;
    amount: number;
    currency?: string;
    category?: string;
    date?: string;
    notes?: string;
    splitType?: SplitType;
    groupId?: string;
    participants: { userId: string; amount?: number; percentage?: number; shares?: number }[];
  }) {
    // if group expense, verify membership
    if (data.groupId) {
      const member = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId: data.groupId, userId } },
      });
      if (!member) throw new ForbiddenError("Not a group member");
    }

    const splitType = data.splitType || "EQUAL";
    const splits = calculateSplits(data.amount, splitType, data.participants);

    const expense = await prisma.expense.create({
      data: {
        description: data.description,
        amount: data.amount,
        currency: data.currency || "INR",
        category: data.category || "general",
        date: data.date ? new Date(data.date) : new Date(),
        notes: data.notes,
        splitType,
        paidById: userId,
        groupId: data.groupId,
        shares: {
          create: splits.map((s) => ({
            userId: s.userId,
            amount: s.amount,
            percentage: s.percentage,
            shares: s.shares,
          })),
        },
      },
      include: {
        shares: { include: { user: { select: { id: true, name: true, email: true } } } },
        paidBy: { select: { id: true, name: true, email: true } },
      },
    });

    // increment daily count for free tier tracking


    // log activity
    await prisma.activity.create({
      data: {
        type: "EXPENSE_CREATED",
        description: `Added "${expense.description}" - ${expense.currency} ${expense.amount}`,
        userId,
        groupId: data.groupId,
        expenseId: expense.id,
      },
    });

    return expense;
  }

  // get single expense with shares and comments
  async getExpense(expenseId: string, userId: string) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        shares: { include: { user: { select: { id: true, name: true, email: true } } } },
        paidBy: { select: { id: true, name: true, email: true } },
        comments: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!expense || expense.isDeleted) throw new NotFoundError("Expense not found");

    // verify user is participant or payer
    const isParticipant = expense.shares.some((s: any) => s.userId === userId) || expense.paidById === userId;
    if (!isParticipant && !expense.groupId) throw new ForbiddenError("Not authorized");

    return expense;
  }

  // list expenses with filters + pagination
  async listExpenses(userId: string, filters: {
    groupId?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    cursor?: string;
    limit?: number;
  }) {
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = {
      isDeleted: false,
      OR: [
        { paidById: userId },
        { shares: { some: { userId } } },
      ],
    };

    if (filters.groupId) where.groupId = filters.groupId;
    if (filters.category) where.category = filters.category;
    if (filters.dateFrom || filters.dateTo) {
      where.date = {};
      if (filters.dateFrom) where.date.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.date.lte = new Date(filters.dateTo);
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        shares: { include: { user: { select: { id: true, name: true } } } },
        paidBy: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
      take: limit + 1,
      ...(filters.cursor ? { cursor: { id: filters.cursor }, skip: 1 } : {}),
    });

    const hasMore = expenses.length > limit;
    const data = hasMore ? expenses.slice(0, limit) : expenses;

    return {
      data,
      nextCursor: hasMore ? data[data.length - 1]?.id : null,
      hasMore,
    };
  }

  // update expense + recalculate splits
  async updateExpense(expenseId: string, userId: string, data: any) {
    const existing = await prisma.expense.findUnique({ where: { id: expenseId } });
    if (!existing || existing.isDeleted) throw new NotFoundError("Expense not found");
    if (existing.paidById !== userId) throw new ForbiddenError("Only payer can edit");

    // store old values for activity log
    const oldData = { description: existing.description, amount: existing.amount.toString() };

    // if participants or amount changed, recalculate splits
    if (data.participants && (data.amount || existing.amount)) {
      const amount = data.amount || Number(existing.amount);
      const splitType = data.splitType || existing.splitType;
      const splits = calculateSplits(amount, splitType, data.participants);

      // delete old shares and create new ones
      await prisma.expenseShare.deleteMany({ where: { expenseId } });
      await prisma.expenseShare.createMany({
        data: splits.map((s) => ({
          expenseId,
          userId: s.userId,
          amount: s.amount,
          percentage: s.percentage,
          shares: s.shares,
        })),
      });
    }

    const { participants, ...updateData } = data;
    const expense = await prisma.expense.update({
      where: { id: expenseId },
      data: updateData,
      include: {
        shares: { include: { user: { select: { id: true, name: true, email: true } } } },
        paidBy: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.activity.create({
      data: {
        type: "EXPENSE_UPDATED",
        description: `Updated "${expense.description}"`,
        userId,
        groupId: expense.groupId,
        expenseId: expense.id,
        metadata: { before: oldData },
      },
    });

    return expense;
  }

  // soft-delete expense
  async deleteExpense(expenseId: string, userId: string) {
    const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
    if (!expense || expense.isDeleted) throw new NotFoundError("Expense not found");
    if (expense.paidById !== userId) throw new ForbiddenError("Only payer can delete");

    await prisma.expense.update({
      where: { id: expenseId },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    await prisma.activity.create({
      data: {
        type: "EXPENSE_DELETED",
        description: `Deleted "${expense.description}"`,
        userId,
        groupId: expense.groupId,
        expenseId: expense.id,
      },
    });
  }
}

export const expenseService = new ExpenseService();
