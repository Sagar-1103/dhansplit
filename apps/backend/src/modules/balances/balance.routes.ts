import { Router } from "../../lib/router";
import { balanceController } from "./balance.controller";
import { authMiddleware } from "../../middleware/auth";

const router = new Router();
router.use(authMiddleware);

router.get("/", balanceController.getOverall);
router.get("/total", balanceController.getTotal);
router.get("/group/:groupId", balanceController.getGroupBalances);
router.get("/group/:groupId/simplified", balanceController.getSimplified);

export default router;
