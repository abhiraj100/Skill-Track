import express from "express";
import { listCourses, getCourse, enroll, myCourses } from "../controllers/courseController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/", listCourses);
router.get("/mine", protect, myCourses);
router.get("/:id", getCourse);
router.post("/:id/enroll", protect, enroll);
export default router;
