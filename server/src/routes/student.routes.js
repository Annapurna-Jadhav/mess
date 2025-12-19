import express from "express";
import authMiddleware from "../middleware/auth.js";
const router = express.Router();
import { verifyReceipt, getStudentProfile } from "../controllers/student.controllers.js";
import { upload } from "../middleware/upload.middleware.js";
router.post(
  "/verify",
 authMiddleware,
  upload.single("receiptImage"),
  verifyReceipt
);

router.get("/me", authMiddleware, getStudentProfile);

export default router;
