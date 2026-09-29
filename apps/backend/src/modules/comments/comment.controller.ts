import { commentService } from "./comment.service";

export class CommentController {
  async add(req: Request, params: any, userId: string) {
    try {
      const comment = await commentService.addComment(params.expenseId as string, userId!, (await req.json() as any).content);
      return Response.json({ success: true, data: comment }, { status: 201 });
    } catch (err) {
      throw err;
    }
  }

  async list(req: Request, params: any, userId: string) {
    try {
      const comments = await commentService.getComments(params.expenseId as string, userId!);
      return Response.json({ success: true, data: comments });
    } catch (err) {
      throw err;
    }
  }
}

export const commentController = new CommentController();
