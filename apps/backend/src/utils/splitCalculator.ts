import { Prisma, SplitType } from "@repo/db";
import { BadRequestError } from "../lib/errors";

interface SplitInput {
  userId: string;
  amount?: number;     // for EXACT
  percentage?: number; // for PERCENTAGE
  shares?: number;     // for SHARES
}

interface SplitResult {
  userId: string;
  amount: Prisma.Decimal;
  percentage?: number;
  shares?: number;
}

// calculates each user's share based on split type
export function calculateSplits(
  totalAmount: number,
  splitType: SplitType,
  participants: SplitInput[],
): SplitResult[] {
  if (participants.length === 0) {
    throw new BadRequestError("At least one participant required");
  }

  switch (splitType) {
    case "EQUAL":
      return splitEqual(totalAmount, participants);
    case "EXACT":
      return splitExact(totalAmount, participants);
    case "PERCENTAGE":
      return splitPercentage(totalAmount, participants);
    case "SHARES":
      return splitShares(totalAmount, participants);
    default:
      throw new BadRequestError(`Invalid split type: ${splitType}`);
  }
}

// divide equally, distribute penny remainders to first participants
function splitEqual(total: number, participants: SplitInput[]): SplitResult[] {
  const n = participants.length;
  const cents = Math.round(total * 100);
  const perPerson = Math.floor(cents / n);
  const remainder = cents - perPerson * n;

  return participants.map((p, i) => ({
    userId: p.userId,
    amount: new Prisma.Decimal((perPerson + (i < remainder ? 1 : 0)) / 100),
  }));
}

// exact amounts — validate they sum to total
function splitExact(total: number, participants: SplitInput[]): SplitResult[] {
  const sum = participants.reduce((acc, p) => acc + (p.amount ?? 0), 0);
  if (Math.abs(sum - total) > 0.01) {
    throw new BadRequestError(`Exact amounts sum to ${sum}, expected ${total}`);
  }

  return participants.map((p) => ({
    userId: p.userId,
    amount: new Prisma.Decimal(p.amount ?? 0),
  }));
}

// percentage split — validate they sum to 100
function splitPercentage(total: number, participants: SplitInput[]): SplitResult[] {
  const sumPct = participants.reduce((acc, p) => acc + (p.percentage ?? 0), 0);
  if (Math.abs(sumPct - 100) > 0.01) {
    throw new BadRequestError(`Percentages sum to ${sumPct}%, expected 100%`);
  }

  return participants.map((p) => ({
    userId: p.userId,
    amount: new Prisma.Decimal(((total * (p.percentage ?? 0)) / 100).toFixed(2)),
    percentage: p.percentage,
  }));
}

// proportional shares (e.g., 2:1:1)
function splitShares(total: number, participants: SplitInput[]): SplitResult[] {
  const totalShares = participants.reduce((acc, p) => acc + (p.shares ?? 1), 0);
  if (totalShares <= 0) {
    throw new BadRequestError("Total shares must be positive");
  }

  return participants.map((p) => {
    const userShares = p.shares ?? 1;
    return {
      userId: p.userId,
      amount: new Prisma.Decimal(((total * userShares) / totalShares).toFixed(2)),
      shares: userShares,
    };
  });
}
