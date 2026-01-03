import { Router } from "express";
import authMiddleware from "../middleware/auth.js";

import { generateMealQR,scanMealEntry } from "../controllers/qr.controllers.js";

const router = Router();

/**
 * Student → Generate QR
 */
router.post("/generateMealQR", authMiddleware, generateMealQR);

/**
 * Mess → Scan QR
 */
router.post("/scanQR", authMiddleware, scanMealEntry);

export default router;
