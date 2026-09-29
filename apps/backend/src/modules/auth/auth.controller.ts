
import { authService } from "./auth.service";

export class AuthController {
  async register(req: Request, params: any, userId: string) {
    try {
      const { email, password, name } = (await req.json() as any);
      const result = await authService.register(email, password, name);
      return Response.json({ success: true, data: result }, { status: 201 });
    } catch (err) {
      throw err;
    }
  }

  async login(req: Request, params: any, userId: string) {
    try {
      const { email, password } = (await req.json() as any);
      const result = await authService.login(email, password);
      return Response.json({ success: true, data: result });
    } catch (err) {
      throw err;
    }
  }

  async refresh(req: Request, params: any, userId: string) {
    try {
      const { refreshToken } = (await req.json() as any);
      const tokens = await authService.refresh(refreshToken);
      return Response.json({ success: true, data: tokens });
    } catch (err) {
      throw err;
    }
  }

  async logout(req: Request, params: any, userId: string) {
    try {
      const { refreshToken } = (await req.json() as any);
      await authService.logout(refreshToken);
      return Response.json({ success: true, message: "Logged out" });
    } catch (err) {
      throw err;
    }
  }
}

export const authController = new AuthController();
