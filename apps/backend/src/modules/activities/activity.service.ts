import { prisma } from "@repo/db";
import { ForbiddenError } from "../../lib/errors";

export class ActivityService {
  async getGlobalFeed(userId: string, cursor?: string, limit = 20) {
    // get activities for user
    const memberships = await prisma.groupMember.findMany({
      where: { 
        userId
      },
      select: { 
        groupId: true
      },
    });
    
    const groupIds = memberships.map((m) => m.groupId);

    const activities = await prisma.activity.findMany({
      where: {
        OR: [
          { userId },
          { groupId: { in: groupIds } },
          { expense: { shares: { some: { userId } } } },
          { settlement: { OR: [{ payerId: userId }, { payeeId: userId }] } },
        ],
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        group: { select: { id: true, name: true } },
        expense: { select: { id: true, description: true, amount: true, currency: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = activities.length > limit;
    const data = hasMore ? activities.slice(0, limit) : activities;

    return {
      data,
      nextCursor: hasMore ? data[data.length - 1]?.id : null,
      hasMore,
    };
  }

  async getGroupFeed(groupId: string, userId: string, cursor?: string, limit = 20) {
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!member) throw new ForbiddenError("Not a group member");

    const activities = await prisma.activity.findMany({
      where: { groupId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        expense: { select: { id: true, description: true, amount: true, currency: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = activities.length > limit;
    const data = hasMore ? activities.slice(0, limit) : activities;

    return {
      data,
      nextCursor: hasMore ? data[data.length - 1]?.id : null,
      hasMore,
    };
  }
}

export const activityService = new ActivityService();
