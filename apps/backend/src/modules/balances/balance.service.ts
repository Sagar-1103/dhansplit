import { prisma } from "@repo/db";
import { computeNetBalances, simplifyDebts } from "../../utils/debtSimplifier";
import { ForbiddenError } from "../../lib/errors";

export class BalanceService {
  // overall balance: who owes the user and who the user owes
  async getOverallBalances(userId: string) {
    // all expenses where user paid or is a participant
    const expenses = await prisma.expense.findMany({
      where: {
        isDeleted: false,
        OR: [{ paidById: userId }, { shares: { some: { userId } } }],
      },
      select: {
        paidById: true,
        shares: { select: { userId: true, amount: true } },
      },
    });

    // all settlements involving user
    const settlements = await prisma.settlement.findMany({
      where: { OR: [{ payerId: userId }, { payeeId: userId }] },
      select: { payerId: true, payeeId: true, amount: true },
    });

    // compute pairwise balances with each person
    const pairwise = new Map<string, number>();
    const addPairwise = (otherId: string, amount: number) => {
      pairwise.set(otherId, (pairwise.get(otherId) ?? 0) + amount);
    };

    for (const exp of expenses) {
      for (const share of exp.shares) {
        if (exp.paidById === userId && share.userId !== userId) {
          addPairwise(share.userId, Number(share.amount)); // they owe me
        } else if (share.userId === userId && exp.paidById !== userId) {
          addPairwise(exp.paidById, -Number(share.amount)); // I owe them
        }
      }
    }

    // from settlements
    for (const s of settlements) {
      if (s.payerId === userId) {
        addPairwise(s.payeeId, -Number(s.amount)); // I paid them
      } else {
        addPairwise(s.payerId, Number(s.amount)); // They paid me
      }
    }

    // fetch user details for each balance
    const userIds = Array.from(pairwise.keys());
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, avatarUrl: true },
    });

    const userMap = new Map(users.map((u: any) => [u.id, u]));
    const balances = [];

    for (const [otherId, amount] of pairwise) {
      if (Math.abs(amount) > 0.01) {
        balances.push({
          user: userMap.get(otherId),
          amount: Math.round(amount * 100) / 100,
          direction: amount > 0 ? "OWED_TO_YOU" : "YOU_OWE",
        });
      }
    }

    return balances;
  }

  // total net balance (positive = you are owed, negative = you owe)
  async getTotalBalance(userId: string) {
    const balances = await this.getOverallBalances(userId);
    const total = balances.reduce((sum, b) => sum + b.amount, 0);
    return { total: Math.round(total * 100) / 100 };
  }

  // balances within a specific group
  async getGroupBalances(groupId: string, userId: string) {
    // verify membership
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!member) throw new ForbiddenError("Not a group member");

    const expenses = await prisma.expense.findMany({
      where: { groupId, isDeleted: false },
      select: {
        paidById: true,
        shares: { select: { userId: true, amount: true } },
      },
    });

    const settlements = await prisma.settlement.findMany({
      where: { groupId },
      select: { payerId: true, payeeId: true, amount: true },
    });

    const expenseData = expenses.map((e: any) => ({
      paidById: e.paidById,
      shares: e.shares.map((s: any) => ({ userId: s.userId, amount: Number(s.amount) })),
    }));

    const settlementData = settlements.map((s: any) => ({
      payerId: s.payerId,
      payeeId: s.payeeId,
      amount: Number(s.amount),
    }));

    const netBalances = computeNetBalances(expenseData, settlementData);

    // fetch user info
    const memberRecords = await prisma.groupMember.findMany({
      where: { groupId },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });
    const userMap = new Map(memberRecords.map((m: any) => [m.userId, m.user]));

    const result = [];
    for (const [uid, balance] of netBalances) {
      if (Math.abs(balance) > 0.01) {
        result.push({
          user: userMap.get(uid),
          balance: Math.round(balance * 100) / 100,
        });
      }
    }

    return result;
  }

  // simplified debts for a group
  async getSimplifiedDebts(groupId: string, userId: string) {
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!member) throw new ForbiddenError("Not a group member");

    const expenses = await prisma.expense.findMany({
      where: { groupId, isDeleted: false },
      select: {
        paidById: true,
        shares: { select: { userId: true, amount: true } },
      },
    });

    const settlements = await prisma.settlement.findMany({
      where: { groupId },
      select: { payerId: true, payeeId: true, amount: true },
    });

    const expenseData = expenses.map((e: any) => ({
      paidById: e.paidById,
      shares: e.shares.map((s: any) => ({ userId: s.userId, amount: Number(s.amount) })),
    }));

    const settlementData = settlements.map((s: any) => ({
      payerId: s.payerId,
      payeeId: s.payeeId,
      amount: Number(s.amount),
    }));

    const netBalances = computeNetBalances(expenseData, settlementData);
    const simplified = simplifyDebts(netBalances);

    // enrich with user info
    const allUserIds = new Set<string>();
    simplified.forEach((d: any) => { allUserIds.add(d.from); allUserIds.add(d.to); });

    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(allUserIds) } },
      select: { id: true, name: true, email: true },
    });
    const userMap = new Map(users.map((u: any) => [u.id, u]));

    return simplified.map((d) => ({
      from: userMap.get(d.from),
      to: userMap.get(d.to),
      amount: d.amount,
    }));
  }
}

export const balanceService = new BalanceService();
