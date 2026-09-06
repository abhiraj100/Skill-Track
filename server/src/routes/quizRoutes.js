import express from "express";
import { getQuiz, submitQuiz } from "../controllers/quizController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/:id", protect, getQuiz);
router.post("/:id/submit", protect, submitQuiz);
export default router;
