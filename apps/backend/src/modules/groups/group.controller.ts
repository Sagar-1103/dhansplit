import { groupService } from "./group.service";

export class GroupController {
  async listGroups(req: Request, params: any, userId: string) {
    try {
      const groups = await groupService.listGroups(userId!);
      return Response.json({ success: true, data: groups });
    } catch (err) {
      throw err;
    }
  }

  async createGroup(req: Request, params: any, userId: string) {
    try {
      const group = await groupService.createGroup(userId!, (await req.json() as any));
      return Response.json({ success: true, data: group }, { status: 201 });
    } catch (err) {
      throw err;
    }
  }

  async getGroup(req: Request, params: any, userId: string) {
    try {
      const group = await groupService.getGroup(params.id as string, userId!);
      return Response.json({ success: true, data: group });
    } catch (err) {
      throw err;
    }
  }

  async updateGroup(req: Request, params: any, userId: string) {
    try {
      const group = await groupService.updateGroup(params.id as string, userId!, (await req.json() as any));
      return Response.json({ success: true, data: group });
    } catch (err) {
      throw err;
    }
  }

  async deleteGroup(req: Request, params: any, userId: string) {
    try {
      await groupService.deleteGroup(params.id as string, userId!);
      return Response.json({ success: true, message: "Group deleted" });
    } catch (err) {
      throw err;
    }
  }

  async addMembers(req: Request, params: any, userId: string) {
    try {
      const group = await groupService.addMembers(params.id as string, userId!, (await req.json() as any).userIds);
      return Response.json({ success: true, data: group });
    } catch (err) {
      throw err;
    }
  }

  async removeMember(req: Request, params: any, userId: string) {
    try {
      await groupService.removeMember(params.id as string, userId!, params.userId as string);
      return Response.json({ success: true, message: "Member removed" });
    } catch (err) {
      throw err;
    }
  }
}

export const groupController = new GroupController();
