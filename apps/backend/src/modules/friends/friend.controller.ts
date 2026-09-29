import { friendService } from "./friend.service";

export class FriendController {
  async listFriends(req: Request, params: any, userId: string) {
    try {
      const friends = await friendService.listFriends(userId!);
      return Response.json({ success: true, data: friends });
    } catch (err) {
      throw err;
    }
  }

  async listPending(req: Request, params: any, userId: string) {
    try {
      const pending = await friendService.listPendingRequests(userId!);
      return Response.json({ success: true, data: pending });
    } catch (err) {
      throw err;
    }
  }

  async sendRequest(req: Request, params: any, userId: string) {
    try {
      const result = await friendService.sendRequest(userId!, (await req.json() as any));
      return Response.json({ success: true, data: result }, { status: 201 });
    } catch (err) {
      throw err;
    }
  }

  async acceptRequest(req: Request, params: any, userId: string) {
    try {
      const result = await friendService.acceptRequest(params.id as string, userId!);
      return Response.json({ success: true, data: result });
    } catch (err) {
      throw err;
    }
  }

  async rejectRequest(req: Request, params: any, userId: string) {
    try {
      await friendService.rejectRequest(params.id as string, userId!);
      return Response.json({ success: true, message: "Request rejected" });
    } catch (err) {
      throw err;
    }
  }

  async removeFriend(req: Request, params: any, userId: string) {
    try {
      await friendService.removeFriend(params.id as string, userId!);
      return Response.json({ success: true, message: "Friend removed" });
    } catch (err) {
      throw err;
    }
  }

  async getSharedExpenses(req: Request, params: any, userId: string) {
    try {
      const expenses = await friendService.getSharedExpenses(userId!, params.id as string);
      return Response.json({ success: true, data: expenses });
    } catch (err) {
      throw err;
    }
  }
}

export const friendController = new FriendController();
