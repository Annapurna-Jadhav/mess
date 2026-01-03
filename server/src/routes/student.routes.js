import express from "express";
import authMiddleware from "../middleware/auth.js";
const router = express.Router();
import {
  verifyReceipt,
  getStudentProfile,
  declareAbsent,
  getStudentMealDays,
  getStudentMealHistory,

} from "../controllers/student.controllers.js";
import { upload } from "../middleware/upload.middleware.js";
import { selectMess } from "../controllers/student.controllers.js"
import { generateMealQR } from "../controllers/qr.controllers.js";
router.post(
  "/verify",
  authMiddleware,
  upload.single("receiptImage"),
  verifyReceipt
);

router.get("/me", authMiddleware, getStudentProfile);
router.post("/select-mess", authMiddleware, selectMess);

router.post("/declare-absent", authMiddleware, declareAbsent);

router.get("/meal-days", authMiddleware, getStudentMealDays);

router.get("/meal-history", authMiddleware, getStudentMealHistory);


router.post("/generateMealQR", authMiddleware, generateMealQR);

export default router;
