import express from "express";
import {
  getTraces,
  getTraceById,
  simulateTrace,
  resetTraces
} from "../controllers/tracingController.js";

const router = express.Router();

router.get("/traces", getTraces);
router.get("/trace/:traceId", getTraceById);
router.post("/simulate", simulateTrace);
router.post("/reset", resetTraces);

export default router;
