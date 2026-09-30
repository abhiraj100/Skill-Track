import express from "express";
import {
  getChaosStatus,
  injectFault,
  runScenario,
  resetChaos
} from "../controllers/chaosController.js";

const router = express.Router();

router.get("/status", getChaosStatus);
router.post("/inject", injectFault);
router.post("/run-scenario", runScenario);
router.post("/reset", resetChaos);

export default router;
