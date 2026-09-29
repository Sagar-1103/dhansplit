import { prisma } from "@repo/db";
import { BadRequestError, ConflictError, NotFoundError } from "../../lib/errors";

export class FriendService {
  // list all accepted friends with balance summary
  async listFriends(userId: string) {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { initiatorId: userId, status: "ACCEPTED" },
          { receiverId: userId, status: "ACCEPTED" },
        ],
      },
      include: {
        initiator: { select: { id: true, email: true, name: true, avatarUrl: true } },
        receiver: { select: { id: true, email: true, name: true, avatarUrl: true } },
      },
    });

    return friendships.map((f: any) => ({
      friendshipId: f.id,
      friend: f.initiatorId === userId ? f.receiver : f.initiator,
      createdAt: f.createdAt,
    }));
  }

  // list pending friend requests received
  async listPendingRequests(userId: string) {
    return prisma.friendship.findMany({
      where: { receiverId: userId, status: "PENDING" },
      include: {
        initiator: { select: { id: true, email: true, name: true, avatarUrl: true } },
      },
    });
  }

  // send friend request by email or userId
  async sendRequest(currentUserId: string, data: { email?: string; userId?: string }) {
    let targetId = data.userId;

    if (data.email) {
      const user = await prisma.user.findUnique({ where: { email: data.email } });
      if (!user) throw new NotFoundError("User not found with this email");
      targetId = user.id;
    }

    if (!targetId) throw new BadRequestError("Provide email or userId");
    if (targetId === currentUserId) throw new BadRequestError("Cannot add yourself");

    // check existing friendship in either direction
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { initiatorId: currentUserId, receiverId: targetId },
          { initiatorId: targetId, receiverId: currentUserId },
        ],
      },
    });

    if (existing) {
      if (existing.status === "ACCEPTED") throw new ConflictError("Already friends");
      if (existing.status === "PENDING") throw new ConflictError("Request already pending");
      throw new ConflictError("Cannot send request");
    }

    const friendship = await prisma.friendship.create({
      data: { initiatorId: currentUserId, receiverId: targetId },
      include: {
        receiver: { select: { id: true, email: true, name: true } },
      },
    });

    // log activity
    await prisma.activity.create({
      data: {
        type: "FRIEND_ADDED",
        description: `Friend request sent`,
        userId: currentUserId,
      },
    });

    return friendship;
  }

  // accept a pending friend request
  async acceptRequest(friendshipId: string, userId: string) {
    const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
    if (!friendship) throw new NotFoundError("Friend request not found");
    if (friendship.receiverId !== userId) throw new BadRequestError("Not your request to accept");
    if (friendship.status !== "PENDING") throw new BadRequestError("Request is not pending");

    return prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: "ACCEPTED" },
    });
  }

  // reject a pending friend request
  async rejectRequest(friendshipId: string, userId: string) {
    const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
    if (!friendship) throw new NotFoundError("Friend request not found");
    if (friendship.receiverId !== userId) throw new BadRequestError("Not your request to reject");

    await prisma.friendship.delete({ where: { id: friendshipId } });
  }

  // remove an accepted friend
  async removeFriend(friendshipId: string, userId: string) {
    const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
    if (!friendship) throw new NotFoundError("Friendship not found");

    const isMember = friendship.initiatorId === userId || friendship.receiverId === userId;
    if (!isMember) throw new BadRequestError("Not part of this friendship");

    await prisma.friendship.delete({ where: { id: friendshipId } });
  }

  // get expenses shared between two friends
  async getSharedExpenses(userId: string, friendId: string) {
    return prisma.expense.findMany({
      where: {
        isDeleted: false,
        groupId: null,
        OR: [
          { paidById: userId, shares: { some: { userId: friendId } } },
          { paidById: friendId, shares: { some: { userId } } },
        ],
      },
      include: { shares: true },
      orderBy: { date: "desc" },
      take: 50,
    });
  }

  // check if two users are friends
  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    const friendship = await prisma.friendship.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { initiatorId: userId1, receiverId: userId2 },
          { initiatorId: userId2, receiverId: userId1 },
        ],
      },
    });
    return !!friendship;
  }
}

export const friendService = new FriendService();
