import express from "express";
import {
  getClusterMetrics,
  executeSaga,
  verifyIdempotency,
  syncCrdt,
  routeSharding,
  simulateCacheStampede
} from "../controllers/scaleController.js";

const router = express.Router();

router.get("/metrics", getClusterMetrics);
router.post("/saga/execute", executeSaga);
router.post("/idempotency/verify", verifyIdempotency);
router.post("/crdt/sync", syncCrdt);
router.post("/sharding/route", routeSharding);
router.post("/cache-stampede/simulate", simulateCacheStampede);

export default router;
