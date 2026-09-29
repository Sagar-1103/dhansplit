import { Router } from "../../lib/router";
import { userController } from "./user.controller";
import { authMiddleware } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { updateProfileSchema, searchUsersSchema } from "./user.schema";

const router = new Router();
router.use(authMiddleware);

router.get("/me", userController.getProfile);
router.patch("/me", validate({ body: updateProfileSchema })(userController.updateProfile));
router.get("/search", validate({ query: searchUsersSchema })(userController.searchUsers));
router.delete("/me", userController.deleteAccount);

export default router;
