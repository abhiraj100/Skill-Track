import express from "express";
import {
  getQueueStats,
  enqueueJobs,
  killWorker,
  retryDlqJobs
} from "../controllers/queueController.js";

const router = express.Router();

router.get("/stats", getQueueStats);
router.post("/enqueue", enqueueJobs);
router.post("/worker/kill", killWorker);
router.post("/dlq/retry", retryDlqJobs);

export default router;
