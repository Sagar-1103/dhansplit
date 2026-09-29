import { Router } from "../../lib/router";
import { activityController } from "./activity.controller";
import { authMiddleware } from "../../middleware/auth";

const router = new Router();
router.use(authMiddleware);

router.get("/", activityController.getGlobalFeed);
router.get("/group/:groupId", activityController.getGroupFeed);

export default router;
