import express from "express";
import {
  getPosts,
  getPostById,
  createPost,
  toggleVote,
  addComment,
  acceptAnswer
} from "../controllers/communityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (anyone can browse posts and comments)
router.get("/posts", getPosts);
router.get("/posts/:id", getPostById);

// Protected routes (require sign-in)
router.post("/posts", protect, createPost);
router.post("/posts/:id/vote", protect, toggleVote);
router.post("/posts/:id/comments", protect, addComment);
router.post("/accept-answer", protect, acceptAnswer);

export default router;
