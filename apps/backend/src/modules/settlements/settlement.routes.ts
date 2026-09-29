import { Router } from "../../lib/router";
import { settlementController } from "./settlement.controller";
import { authMiddleware } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createSettlementSchema } from "./settlement.schema";

const router = new Router();
router.use(authMiddleware);

router.get("/", settlementController.list);
router.post("/", validate({ body: createSettlementSchema })(settlementController.create));
router.get("/:id", settlementController.get);
router.delete("/:id", settlementController.delete);

export default router;
