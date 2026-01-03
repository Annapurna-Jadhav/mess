// src/routes/mess.routes.js
import express from "express";
import {
  applyMessManager,
  getMessDailyStats,
  getMessProfile,
  getMessMealEvents,
  
} from "../controllers/mess.controllers.js";
import { scanMealEntry ,scanMealQRFromImage} from "../controllers/qr.controllers.js";
import authMiddleware from "../middleware/auth.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();
router.get("/profile",authMiddleware,getMessProfile)

router.post("/apply", applyMessManager);
router.get("/me", authMiddleware, getMessProfile);

router.get("/stats", authMiddleware, getMessDailyStats);

router.get("/events", authMiddleware, getMessMealEvents);


router.post("/scanQR", authMiddleware, scanMealEntry);
router.post(
  "/scan-image",
  authMiddleware,
  upload.single("qrImage"),
scanMealQRFromImage
);


export default router;
