import express from "express";
import {
  skillGap,
  resumeAnalysis,
  jobMatch,
  mockInterviewQuestions,
  evaluateInterviewAnswer,
  generateCoverLetter
} from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.post("/skill-gap", skillGap);
router.post("/resume-analysis", resumeAnalysis);
router.post("/job-match", jobMatch);
router.post("/interview-questions", mockInterviewQuestions);
router.post("/interview-evaluate", evaluateInterviewAnswer);
router.post("/cover-letter", generateCoverLetter);

export default router;
