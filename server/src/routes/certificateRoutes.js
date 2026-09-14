import express from "express";
import {
  getUserCertificates,
  claimCertificate,
  verifyCertificate
} from "../controllers/certificateController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public verification route
router.get("/verify/:query", verifyCertificate);

// Protected routes for authenticated students
router.get("/", protect, getUserCertificates);
router.post("/claim", protect, claimCertificate);

export default router;
