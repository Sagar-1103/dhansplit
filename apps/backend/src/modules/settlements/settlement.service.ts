import { prisma } from "@repo/db";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../lib/errors";
import type { SettlementMethod } from "@repo/db";

export class SettlementService {
  // record a settlement payment
  async createSettlement(userId: string, data: {
    amount: number;
    currency?: string;
    method?: SettlementMethod;
    notes?: string;
    payeeId: string;
    groupId?: string;
  }) {
    if (data.payeeId === userId) throw new BadRequestError("Cannot settle with yourself");

    // if group settlement, verify both users are members
    if (data.groupId) {
      const members = await prisma.groupMember.findMany({
        where: { groupId: data.groupId, userId: { in: [userId, data.payeeId] } },
      });
      if (members.length < 2) throw new ForbiddenError("Both users must be in the group");
    }

    const settlement = await prisma.settlement.create({
      data: {
        amount: data.amount,
        currency: data.currency || "INR",
        method: data.method || "CASH",
        notes: data.notes,
        payerId: userId,
        payeeId: data.payeeId,
        groupId: data.groupId,
      },
      include: {
        payer: { select: { id: true, name: true, email: true } },
        payee: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.activity.create({
      data: {
        type: "SETTLEMENT_CREATED",
        description: `${settlement.payer.name} paid ${settlement.payee.name} ${settlement.currency} ${settlement.amount}`,
        userId,
        groupId: data.groupId,
        settlementId: settlement.id,
      },
    });

    return settlement;
  }

  // list settlements for user, optionally filtered by group
  async listSettlements(userId: string, groupId?: string) {
    const where: any = {
      OR: [{ payerId: userId }, { payeeId: userId }],
    };
    if (groupId) where.groupId = groupId;

    return prisma.settlement.findMany({
      where,
      include: {
        payer: { select: { id: true, name: true, email: true } },
        payee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  // get single settlement
  async getSettlement(settlementId: string, userId: string) {
    const settlement = await prisma.settlement.findUnique({
      where: { id: settlementId },
      include: {
        payer: { select: { id: true, name: true, email: true } },
        payee: { select: { id: true, name: true, email: true } },
      },
    });
    if (!settlement) throw new NotFoundError("Settlement not found");

    if (settlement.payerId !== userId && settlement.payeeId !== userId) {
      throw new ForbiddenError("Not authorized");
    }
    return settlement;
  }

  // delete settlement (reverses balance effect)
  async deleteSettlement(settlementId: string, userId: string) {
    const settlement = await prisma.settlement.findUnique({ where: { id: settlementId } });
    if (!settlement) throw new NotFoundError("Settlement not found");
    if (settlement.payerId !== userId) throw new ForbiddenError("Only payer can delete");

    await prisma.settlement.delete({ where: { id: settlementId } });

    await prisma.activity.create({
      data: {
        type: "SETTLEMENT_DELETED",
        description: `Settlement of ${settlement.currency} ${settlement.amount} deleted`,
        userId,
        groupId: settlement.groupId,
      },
    });
  }
}

export const settlementService = new SettlementService();
