import express from "express";
import { createNote, deleteNote, listNotes, updateNote } from "../controllers/studyNoteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);
router.route("/").get(listNotes).post(createNote);
router.route("/:id").put(updateNote).delete(deleteNote);

export default router;
