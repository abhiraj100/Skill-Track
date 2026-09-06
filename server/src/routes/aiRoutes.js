import express from "express";
import { skillGap, resumeAnalysis, jobMatch } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.use(protect);
router.post("/skill-gap", skillGap);
router.post("/resume-analysis", resumeAnalysis);
router.post("/job-match", jobMatch);
export default router;
