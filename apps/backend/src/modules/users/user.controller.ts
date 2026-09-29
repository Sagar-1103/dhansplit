import { userService } from "./user.service";

export class UserController {
  async getProfile(req: Request, params: any, userId: string) {
    try {
      const user = await userService.getProfile(userId!);
      return Response.json({ success: true, data: user });
    } catch (err) {
      throw err;
    }
  }

  async updateProfile(req: Request, params: any, userId: string) {
    try {
      const user = await userService.updateProfile(userId!, (await req.json() as any));
      return Response.json({ success: true, data: user });
    } catch (err) {
      throw err;
    }
  }

  async searchUsers(req: Request, params: any, userId: string) {
    try {
      const users = await userService.searchUsers(new URL(req.url).searchParams.get("q") as string, userId!);
      return Response.json({ success: true, data: users });
    } catch (err) {
      throw err;
    }
  }

  async deleteAccount(req: Request, params: any, userId: string) {
    try {
      await userService.deleteAccount(userId!);
      return Response.json({ success: true, message: "Account deleted" });
    } catch (err) {
      throw err;
    }
  }
}

export const userController = new UserController();
