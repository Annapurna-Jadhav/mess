// routes/admin.routes.js
import express from "express";
import {
  getPendingApps,
  approveMessApp,
  rejectMessApp,
  getApprovedMesses,
} from "../controllers/admin.controller.js";


const router = express.Router();

router.get("/mess-applications/pending", getPendingApps);
router.post("/mess-applications/:id/approve", approveMessApp);
router.post("/mess-applications/:id/reject", rejectMessApp);
router.get("/messes", getApprovedMesses);

export default router;
