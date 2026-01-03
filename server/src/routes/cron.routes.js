import { Router } from "express";
import authMiddleware from "../middleware/auth.js";
import { simulateDailyStats,simulateSettlement,simulateFullDay,simulateNoShow } from "../controllers/cronJobs.js";


const router = Router();
router.post("/simulate/no-show",authMiddleware, simulateNoShow);
router.post("/simulate/settle",authMiddleware, simulateSettlement);
router.post("/simulate/stats", authMiddleware,simulateDailyStats);
router.post("/simulate/full-day",authMiddleware, simulateFullDay);

router.get("/predict/:messId", predictMessInsights);
export default router