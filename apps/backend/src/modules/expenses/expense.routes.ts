import { Router } from "../../lib/router";
import { expenseController } from "./expense.controller";
import { authMiddleware } from "../../middleware/auth";

import { validate } from "../../middleware/validate";
import { createExpenseSchema, updateExpenseSchema, listExpensesSchema } from "./expense.schema";

const router = new Router();
router.use(authMiddleware);

router.get("/", validate({ query: listExpensesSchema })(expenseController.list));
router.post("/", validate({ body: createExpenseSchema })(expenseController.create));
router.get("/:id", expenseController.get);
router.patch("/:id", validate({ body: updateExpenseSchema })(expenseController.update));
router.delete("/:id", expenseController.delete);

export default router;
