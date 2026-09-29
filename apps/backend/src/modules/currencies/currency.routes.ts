import { Router } from "../../lib/router";
import { currencyController } from "./currency.controller";
import { authMiddleware } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { convertCurrencySchema } from "./currency.schema";

const router = new Router();
router.use(authMiddleware);

router.get("/", currencyController.list);
router.get("/convert", validate({ query: convertCurrencySchema })(currencyController.convert));

export default router;
