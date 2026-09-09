import express from "express";
import { getQuiz, getCourseQuiz, getMyAttempts, submitQuiz } from "../controllers/quizController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/course/:courseId", protect, getCourseQuiz);
router.get("/:id/attempts", protect, getMyAttempts);
router.get("/:id", protect, getQuiz);
router.post("/:id/submit", protect, submitQuiz);
export default router;
