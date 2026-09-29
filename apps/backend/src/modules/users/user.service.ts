import { prisma } from "@repo/db";
import { NotFoundError } from "../../lib/errors";

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  avatarUrl: true,
  phone: true,
  defaultCurrency: true,
  isPro: true,
  createdAt: true,
};

export class UserService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: USER_SELECT });
    if (!user) throw new NotFoundError("User not found");
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string; avatarUrl?: string; defaultCurrency?: string }) {
    return prisma.user.update({ where: { id: userId }, data, select: USER_SELECT });
  }

  // search by email or name (for adding friends)
  async searchUsers(query: string, currentUserId: string) {
    return prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } },
          {
            OR: [
              { email: { contains: query, mode: "insensitive" } },
              { name: { contains: query, mode: "insensitive" } },
            ],
          },
        ],
      },
      select: { id: true, email: true, name: true, avatarUrl: true },
      take: 20,
    });
  }

  async deleteAccount(userId: string) {
    await prisma.user.delete({ where: { id: userId } });
  }
}

export const userService = new UserService();
