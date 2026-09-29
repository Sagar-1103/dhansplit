import { createHash } from "crypto";
import { prisma } from "@repo/db";
import { hashPassword, comparePassword } from "../../lib/password";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../lib/jwt";
import { BadRequestError, ConflictError, UnauthorizedError } from "../../lib/errors";

export class AuthService {
  async register(email: string, password: string, name: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictError("Email already registered");

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
      select: { id: true, email: true, name: true, defaultCurrency: true, isPro: true },
    });

    const tokens = await this.createTokens(user.id);
    return { user, ...tokens };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedError("Invalid email or password");

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError("Invalid email or password");

    const tokens = await this.createTokens(user.id);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        defaultCurrency: user.defaultCurrency,
        isPro: user.isPro,
      },
      ...tokens,
    };
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) throw new UnauthorizedError("Invalid refresh token");

    const tokenHash = this.hashToken(refreshToken);

    const stored = await prisma.refreshToken.findUnique({ where: { token: tokenHash } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedError("Refresh token expired or revoked");
    }

    // delete old token and create new one
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    const tokens = await this.createTokens(payload.userId);
    return tokens;
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    // revoking refresh token
    await prisma.refreshToken.deleteMany({ where: { token: tokenHash } });
  }

  private async createTokens(userId: string) {
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const tokenHash = this.hashToken(refreshToken);

    // remove any expired tokens for the user
    await prisma.refreshToken.deleteMany({
      where: {
        userId,
        expiresAt: { lt: new Date() },
      },
    });

    await prisma.refreshToken.create({
      data: { 
        token: tokenHash,
        userId,
        expiresAt
      },
    });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
