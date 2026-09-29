import type { RouteHandler } from "../lib/router";
import { verifyAccessToken } from "../lib/jwt";
import { UnauthorizedError } from "../lib/errors";

export function authMiddleware(handler: any): RouteHandler {
  return (req: Request, params?: any) => {
    const token = req.headers.get("authorization")?.split("Bearer ")?.[1];
    if (!token) {
      throw new UnauthorizedError("Missing or invalid authorization header");
    }

    const payload = verifyAccessToken(token);
    
    if (!payload) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    return handler(req, params, payload.userId);
  };
}
