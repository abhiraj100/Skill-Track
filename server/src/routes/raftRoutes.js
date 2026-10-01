// server/src/routes/raftRoutes.js
import express from "express";
import {
  getRaftState,
  replicateCommand,
  crashLeader,
  recoverNode,
  simulatePartition,
  healPartition,
  resetCluster
} from "../controllers/raftController.js";

const router = express.Router();

router.get("/state", getRaftState);
router.post("/replicate", replicateCommand);
router.post("/crash-leader", crashLeader);
router.post("/recover-node", recoverNode);
router.post("/partition", simulatePartition);
router.post("/heal-partition", healPartition);
router.post("/reset", resetCluster);

export default router;
