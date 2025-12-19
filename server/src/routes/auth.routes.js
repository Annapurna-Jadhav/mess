import express from "express";
import authMiddleware from "../middleware/auth.js";
import { continueAuth } from "../controllers/auth.controllers.js";
import { verifyReceipt } from "../controllers/student.controllers.js";
import { upload } from "../middleware/upload.middleware.js";


const router = express.Router();


router.post("/continue", authMiddleware, continueAuth);








export default router;
