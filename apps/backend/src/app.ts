import { Router } from "./lib/router";
import { env } from "./config/env";

import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import friendRoutes from "./modules/friends/friend.routes";
import groupRoutes from "./modules/groups/group.routes";
import expenseRoutes from "./modules/expenses/expense.routes";
import settlementRoutes from "./modules/settlements/settlement.routes";
import balanceRoutes from "./modules/balances/balance.routes";
import activityRoutes from "./modules/activities/activity.routes";
import commentRoutes from "./modules/comments/comment.routes";
import currencyRoutes from "./modules/currencies/currency.routes";
import recurringRoutes from "./modules/recurring/recurring.routes";

const app = new Router();

app.get("/api/health", () => Response.json({ success: true, status: "UP" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/settlements", settlementRoutes);
app.use("/api/balances", balanceRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/currencies", currencyRoutes);
app.use("/api/recurring", recurringRoutes);

export default app;
