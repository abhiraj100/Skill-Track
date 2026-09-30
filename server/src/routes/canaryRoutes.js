import express from "express";
import {
  getCanaryStatus,
  updateRollout,
  toggleFeatureFlag,
  simulateTrafficBurst,
  abortRollout
} from "../controllers/canaryController.js";

const router = express.Router();

router.get("/status", getCanaryStatus);
router.post("/rollout/update", updateRollout);
router.post("/flags/toggle", toggleFeatureFlag);
router.post("/simulate-traffic", simulateTrafficBurst);
router.post("/abort", abortRollout);

export default router;
