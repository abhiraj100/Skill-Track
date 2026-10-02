// server/src/routes/gossipRoutes.js
import express from "express";
import {
  getGossipState,
  stepGossipRound,
  failNode,
  recoverNode,
  broadcastRumor,
  resetGossip
} from "../controllers/gossipController.js";

const router = express.Router();

router.get("/state", getGossipState);
router.post("/step", stepGossipRound);
router.post("/fail-node", failNode);
router.post("/recover-node", recoverNode);
router.post("/rumor", broadcastRumor);
router.post("/reset", resetGossip);

export default router;
