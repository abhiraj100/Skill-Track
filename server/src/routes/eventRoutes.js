import express from "express";
import {
  getEventStream,
  appendEvent,
  replayEvents,
  createSnapshot,
  getProjections,
  resetLedger
} from "../controllers/eventController.js";

const router = express.Router();

router.get("/stream/:aggregateId?", getEventStream);
router.post("/append", appendEvent);
router.post("/replay", replayEvents);
router.post("/snapshot", createSnapshot);
router.get("/projections", getProjections);
router.post("/reset", resetLedger);

export default router;
