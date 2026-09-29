import { Router } from "../../lib/router";
import { recurringController } from "./recurring.controller";
import { authMiddleware } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createRecurringSchema, updateRecurringSchema } from "./recurring.schema";

const router = new Router();
router.use(authMiddleware);

router.post("/", validate({ body: createRecurringSchema })(recurringController.create));
router.get("/", recurringController.list);
router.patch("/:id", validate({ body: updateRecurringSchema })(recurringController.update));
router.delete("/:id", recurringController.delete);

export default router;
