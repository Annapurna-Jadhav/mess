// src/routes/mess.routes.js
import express from "express";
import { applyMessManager } from "../controllers/mess.controllers.js";

const router = express.Router();

router.post("/apply", applyMessManager);

export default router;
