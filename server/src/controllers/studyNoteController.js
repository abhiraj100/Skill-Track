import StudyNote from "../models/StudyNote.js";
import Course from "../models/Course.js";

const sanitizeTags = (tags) => Array.isArray(tags) ? [...new Set(tags.map((tag) => String(tag).trim()).filter(Boolean))].slice(0, 8) : [];

export const listNotes = async (req, res, next) => {
  try {
    const { search = "", course, pinned } = req.query;
    const filter = { user: req.user._id };
    if (course) filter.course = course;
    if (pinned === "true") filter.pinned = true;
    if (search.trim()) filter.$or = [
      { title: { $regex: search.trim(), $options: "i" } },
      { content: { $regex: search.trim(), $options: "i" } },
      { tags: { $regex: search.trim(), $options: "i" } }
    ];
    const notes = await StudyNote.find(filter).populate("course", "title").sort({ pinned: -1, updatedAt: -1 });
    res.json({ success: true, notes });
  } catch (e) { next(e); }
};

export const createNote = async (req, res, next) => {
  try {
    const { title, content, course, pinned } = req.body;
    if (!title?.trim() || !content?.trim()) { res.status(400); throw new Error("A title and note content are required"); }
    if (course && !(await Course.exists({ _id: course }))) { res.status(404); throw new Error("Selected course was not found"); }
    const note = await StudyNote.create({ user: req.user._id, title: title.trim(), content: content.trim(), course: course || null, tags: sanitizeTags(req.body.tags), pinned: Boolean(pinned) });
    await note.populate("course", "title");
    res.status(201).json({ success: true, note });
  } catch (e) { next(e); }
};

export const updateNote = async (req, res, next) => {
  try {
    const { title, content, course, pinned } = req.body;
    if (!title?.trim() || !content?.trim()) { res.status(400); throw new Error("A title and note content are required"); }
    if (course && !(await Course.exists({ _id: course }))) { res.status(404); throw new Error("Selected course was not found"); }
    const note = await StudyNote.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title: title.trim(), content: content.trim(), course: course || null, tags: sanitizeTags(req.body.tags), pinned: Boolean(pinned) },
      { new: true, runValidators: true }
    ).populate("course", "title");
    if (!note) { res.status(404); throw new Error("Note not found"); }
    res.json({ success: true, note });
  } catch (e) { next(e); }
};

export const deleteNote = async (req, res, next) => {
  try {
    const note = await StudyNote.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) { res.status(404); throw new Error("Note not found"); }
    res.json({ success: true });
  } catch (e) { next(e); }
};
