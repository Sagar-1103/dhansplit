import { activityService } from "./activity.service";
import { parsePagination } from "../../utils/pagination";

export class ActivityController {
  async getGlobalFeed(req: Request, params: any, userId: string) {
    try {
      const { cursor, limit } = parsePagination(Object.fromEntries(new URL(req.url).searchParams.entries()) as any);
      const result = await activityService.getGlobalFeed(userId!, cursor, limit);
      return Response.json({ success: true, ...result });
    } catch (err) {
      throw err;
    }
  }

  async getGroupFeed(req: Request, params: any, userId: string) {
    try {
      const { cursor, limit } = parsePagination(Object.fromEntries(new URL(req.url).searchParams.entries()) as any);
      const result = await activityService.getGroupFeed(params.groupId as string, userId!, cursor, limit);
      return Response.json({ success: true, ...result });
    } catch (err) {
      throw err;
    }
  }
}

export const activityController = new ActivityController();
