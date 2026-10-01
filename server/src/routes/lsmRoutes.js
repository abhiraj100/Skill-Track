// server/src/routes/lsmRoutes.js
import express from "express";
import {
  getLsmState,
  putKey,
  deleteKey,
  manualFlush,
  compactLeveled,
  queryKey,
  resetLsm
} from "../controllers/lsmController.js";

const router = express.Router();

router.get("/state", getLsmState);
router.post("/put", putKey);
router.post("/delete", deleteKey);
router.post("/flush", manualFlush);
router.post("/compact", compactLeveled);
router.post("/query", queryKey);
router.post("/reset", resetLsm);

export default router;
