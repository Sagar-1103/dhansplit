import { Router } from "../../lib/router";
import { commentController } from "./comment.controller";
import { authMiddleware } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { addCommentSchema } from "./comment.schema";

const router = new Router();
router.use(authMiddleware);

router.post("/:expenseId", validate({ body: addCommentSchema })(commentController.add));
router.get("/:expenseId", commentController.list);

export default router;
