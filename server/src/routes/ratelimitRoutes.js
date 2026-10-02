// server/src/routes/ratelimitRoutes.js
import express from "express";
import {
  getRateLimiterState,
  switchAlgorithm,
  blastTraffic,
  resetRateLimiter
} from "../controllers/ratelimitController.js";

const router = express.Router();

router.get("/state", getRateLimiterState);
router.post("/switch-algorithm", switchAlgorithm);
router.post("/blast", blastTraffic);
router.post("/reset", resetRateLimiter);

export default router;
