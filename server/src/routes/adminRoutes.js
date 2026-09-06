import express from "express";
import { stats } from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/stats", protect, adminOnly, stats);
export default router;
