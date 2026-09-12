import express from "express";
import { getMindGameSummary, saveMindGameAttempt } from "../controllers/mindGameController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);
router.get("/summary", getMindGameSummary);
router.post("/attempts", saveMindGameAttempt);

export default router;
