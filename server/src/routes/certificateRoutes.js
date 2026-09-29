import express from "express";
import {
  getUserCertificates,
  claimCertificate,
  verifyCertificate,
  batchVerifyCertificates
} from "../controllers/certificateController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public verification routes
router.get("/verify/:query", verifyCertificate);
router.post("/batch-verify", batchVerifyCertificates);

// Protected routes for authenticated students
router.get("/", protect, getUserCertificates);
router.post("/claim", protect, claimCertificate);

export default router;
