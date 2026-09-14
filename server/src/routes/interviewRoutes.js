import express from "express";
import {
  getInterviewHistory,
  createInterviewSession,
  updateInterviewSession,
  getInterviewSessionById
} from "../controllers/interviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/", getInterviewHistory);
router.post("/", createInterviewSession);
router.get("/:id", getInterviewSessionById);
router.put("/:id", updateInterviewSession);

export default router;
