// routes/admin.routes.js
import express from "express";
import {
  getPendingApps,
  approveMessApp,
  rejectMessApp,
  getApprovedMesses,
} from "../controllers/admin.controller.js";
import { markNoShowForMeal } from "../crons/markNoShow.js";
import { settleMealWallet } from "../crons/settleMealWallet.js";
import { buildDailyStats } from "../crons/buildDailyStats.js";
import authMiddleware from "../middleware/auth.js";


const router = express.Router();

router.get("/mess-applications/pending", authMiddleware,getPendingApps);
router.post("/mess-applications/:id/approve", authMiddleware,approveMessApp);
router.post("/mess-applications/:id/reject",authMiddleware, rejectMessApp);
router.get("/messes", authMiddleware,getApprovedMesses);



// cron jobs

router.post("/cron/no-show/:mealType", authMiddleware, async (req, res) => {
  await markNoShowForMeal(req.params.mealType);
  res.json({ message: "NO_SHOW cron executed" });
});

router.post("/cron/settle/:mealType", authMiddleware, async (req, res) => {
  await settleMealWallet(req.params.mealType);
  res.json({ message: "Wallet settlement done" });
});

router.post("/cron/daily-stats", authMiddleware, async (req, res) => {
  await buildDailyStats();
  res.json({ message: "Daily stats generated" });
});

export default router;
