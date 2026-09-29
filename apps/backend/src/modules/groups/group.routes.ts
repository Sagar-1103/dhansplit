import { Router } from "../../lib/router";
import { groupController } from "./group.controller";
import { authMiddleware } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createGroupSchema, updateGroupSchema, addMembersSchema } from "./group.schema";

const router = new Router();
router.use(authMiddleware);

router.get("/", groupController.listGroups);
router.post("/", validate({ body: createGroupSchema })(groupController.createGroup));
router.get("/:id", groupController.getGroup);
router.patch("/:id", validate({ body: updateGroupSchema })(groupController.updateGroup));
router.delete("/:id", groupController.deleteGroup);
router.post("/:id/members", validate({ body: addMembersSchema })(groupController.addMembers));
router.delete("/:id/members/:userId", groupController.removeMember);

export default router;
