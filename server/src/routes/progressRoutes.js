import express from "express";
import { completeLesson, toggleLesson, getProgress } from "../controllers/progressController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.post("/complete", protect, completeLesson);
router.post("/toggle", protect, toggleLesson);
router.get("/:courseId", protect, getProgress);
export default router;
