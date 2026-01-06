import express from "express";
import authMiddleware from "../middleware/auth.js";
const router = express.Router();
import {
  verifyReceipt,
  getStudentProfile,
  declareAbsent,
   selectMess ,getStudentMealDays,getStudentMealHistory
  

} from "../controllers/student.controllers.js";
import { upload } from "../middleware/upload.middleware.js";

import { generateMealQR } from "../controllers/qr.controllers.js";
import { getStudentAnalytics } from "../controllers/analytics.controllers.js";
import { getMyFeedbacks, submitFeedback } from "../controllers/feedback.controllers.js";
router.post(
  "/verify",
  authMiddleware,
  upload.single("receiptImage"),
  verifyReceipt
);

router.get("/me", authMiddleware, getStudentProfile);
router.post("/select-mess", authMiddleware, selectMess);

router.post("/declare-absent", authMiddleware, declareAbsent);

router.post("/submitFeedback",authMiddleware,submitFeedback);
router.get("/myFeedbacks",authMiddleware,getMyFeedbacks);
router.post("/generateMealQR", authMiddleware, generateMealQR);
router.get("/analytics",authMiddleware,getStudentAnalytics)
router.get("/meal-days", authMiddleware, getStudentMealDays);
router.get("/meal-history", authMiddleware, getStudentMealHistory);


export default router;
