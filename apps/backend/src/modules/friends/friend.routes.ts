import { Router } from "../../lib/router";
import { friendController } from "./friend.controller";
import { authMiddleware } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { sendRequestSchema } from "./friend.schema";

const router = new Router();
router.use(authMiddleware);

router.get("/", friendController.listFriends);
router.get("/pending", friendController.listPending);
router.post("/request", validate({ body: sendRequestSchema })(friendController.sendRequest));
router.post("/:id/accept", friendController.acceptRequest);
router.post("/:id/reject", friendController.rejectRequest);
router.delete("/:id", friendController.removeFriend);
router.get("/:id/expenses", friendController.getSharedExpenses);

export default router;
