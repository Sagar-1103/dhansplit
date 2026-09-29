import { Router } from "../../lib/router";
import { authController } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { registerSchema, loginSchema, refreshSchema } from "./auth.schema";

const router = new Router();

router.post("/register", validate({ body: registerSchema })(authController.register));
router.post("/login", validate({ body: loginSchema })(authController.login));
router.post("/refresh", validate({ body: refreshSchema })(authController.refresh));
router.post("/logout", authController.logout);

export default router;
