import { Router } from "express";
import userRoutes from "./user.routes";
import authRoutes from "./auth.routes";
import transactionRoutes from "./transaction.routes";

const router: Router = Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/transactions", transactionRoutes);

export default router;
