import express from "express";
import { getIamDirectory, evaluateAccessPolicy } from "../controllers/iamController.js";

const router = express.Router();

router.get("/directory", getIamDirectory);
router.post("/evaluate", evaluateAccessPolicy);

export default router;
