import express from "express";
import { completeLesson, getProgress } from "../controllers/progressController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.post("/complete", protect, completeLesson);
router.get("/:courseId", protect, getProgress);
export default router;
