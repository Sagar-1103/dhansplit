import { prisma } from "@repo/db";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../lib/errors";

export class GroupService {
  // list all groups the user belongs to
  async listGroups(userId: string) {
    const memberships = await prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
            },
          },
        },
      },
    });

    return memberships.map((m: any) => m.group);
  }

  // create group + add creator as admin + add specified members
  async createGroup(userId: string, data: {
    name: string;
    type?: string;
    defaultCurrency?: string;
    simplifyDebts?: boolean;
    memberIds?: string[];
  }) {
    const group = await prisma.group.create({
      data: {
        name: data.name,
        type: (data.type as any) || "OTHER",
        defaultCurrency: data.defaultCurrency || "INR",
        simplifyDebts: data.simplifyDebts ?? true,
        createdById: userId,
        members: {
          create: [
            { userId, role: "ADMIN" },
            ...(data.memberIds || [])
              .filter((id) => id !== userId)
              .map((id) => ({ userId: id, role: "MEMBER" as const })),
          ],
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        },
      },
    });

    // log activity
    await prisma.activity.create({
      data: {
        type: "GROUP_CREATED",
        description: `Group "${group.name}" created`,
        userId,
        groupId: group.id,
      },
    });

    return group;
  }

  // get group with members
  async getGroup(groupId: string, userId: string) {
    await this.assertMember(groupId, userId);

    return prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        },
      },
    });
  }

  // update group (admin only)
  async updateGroup(groupId: string, userId: string, data: any) {
    await this.assertAdmin(groupId, userId);

    const group = await prisma.group.update({
      where: { id: groupId },
      data,
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        },
      },
    });

    await prisma.activity.create({
      data: {
        type: "GROUP_UPDATED",
        description: `Group "${group.name}" updated`,
        userId,
        groupId: group.id,
      },
    });

    return group;
  }

  // delete group (admin only)
  async deleteGroup(groupId: string, userId: string) {
    await this.assertAdmin(groupId, userId);
    await prisma.group.delete({ where: { id: groupId } });
  }

  // add members to group
  async addMembers(groupId: string, userId: string, userIds: string[]) {
    await this.assertMember(groupId, userId);

    const existing = await prisma.groupMember.findMany({
      where: { groupId, userId: { in: userIds } },
    });
    const existingIds = new Set(existing.map((m: any) => m.userId));
    const newIds = userIds.filter((id) => !existingIds.has(id));

    if (newIds.length === 0) throw new BadRequestError("All users already in group");

    await prisma.groupMember.createMany({
      data: newIds.map((id) => ({ groupId, userId: id })),
    });

    // log each addition
    for (const id of newIds) {
      await prisma.activity.create({
        data: {
          type: "GROUP_MEMBER_ADDED",
          description: `Member added to group`,
          userId,
          groupId,
          metadata: { addedUserId: id },
        },
      });
    }

    return this.getGroup(groupId, userId);
  }

  // remove member from group
  async removeMember(groupId: string, requesterId: string, targetUserId: string) {
    // only admin or self can remove
    const requester = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: requesterId } },
    });
    if (!requester) throw new ForbiddenError("Not a member");
    if (requesterId !== targetUserId && requester.role !== "ADMIN") {
      throw new ForbiddenError("Only admins can remove others");
    }

    await prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId: targetUserId } },
    });

    await prisma.activity.create({
      data: {
        type: "GROUP_MEMBER_REMOVED",
        description: `Member removed from group`,
        userId: requesterId,
        groupId,
        metadata: { removedUserId: targetUserId },
      },
    });
  }

  // verify user is a group member
  async assertMember(groupId: string, userId: string) {
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!member) throw new ForbiddenError("Not a member of this group");
    return member;
  }

  // verify user is a group admin
  async assertAdmin(groupId: string, userId: string) {
    const member = await this.assertMember(groupId, userId);
    if (member.role !== "ADMIN") throw new ForbiddenError("Admin access required");
    return member;
  }
}

export const groupService = new GroupService();
