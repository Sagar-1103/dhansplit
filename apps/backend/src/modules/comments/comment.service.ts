import { prisma } from "@repo/db";
import { ForbiddenError, NotFoundError } from "../../lib/errors";

export class CommentService {
  async addComment(expenseId: string, userId: string, content: string) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: { shares: true },
    });

    if (!expense || expense.isDeleted) throw new NotFoundError("Expense not found");

    const isParticipant = expense.shares.some((s: any) => s.userId === userId) || expense.paidById === userId;
    if (!isParticipant && !expense.groupId) throw new ForbiddenError("Not authorized to comment");

    const comment = await prisma.comment.create({
      data: { content, userId, expenseId },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });

    await prisma.activity.create({
      data: {
        type: "COMMENT_ADDED",
        description: `Commented on "${expense.description}"`,
        userId,
        expenseId,
        groupId: expense.groupId,
      },
    });

    return comment;
  }

  async getComments(expenseId: string, userId: string) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: { shares: true },
    });

    if (!expense || expense.isDeleted) throw new NotFoundError("Expense not found");

    const isParticipant = expense.shares.some((s: any) => s.userId === userId) || expense.paidById === userId;
    if (!isParticipant && !expense.groupId) throw new ForbiddenError("Not authorized to view comments");

    return prisma.comment.findMany({
      where: { expenseId },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: "asc" },
    });
  }
}

export const commentService = new CommentService();
