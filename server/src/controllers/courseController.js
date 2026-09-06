import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

export const listCourses = async (req, res, next) => {
  try {
    const { search, category, difficulty } = req.query;
    const filter = {};
    if (search) filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { skills: { $regex: search, $options: "i" } }
    ];
    if (category && category !== "All") filter.category = category;
    if (difficulty && difficulty !== "All") filter.difficulty = difficulty;
    const courses = await Course.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, courses });
  } catch (e) { next(e); }
};

export const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) { res.status(404); throw new Error("Course not found"); }
    res.json({ success: true, course });
  } catch (e) { next(e); }
};

export const enroll = async (req, res, next) => {
  try {
    const existing = await Enrollment.findOne({ user: req.user._id, course: req.params.id });
    if (existing) return res.json({ success: true, enrollment: existing });
    const enrollment = await Enrollment.create({ user: req.user._id, course: req.params.id });
    res.status(201).json({ success: true, enrollment });
  } catch (e) { next(e); }
};

export const myCourses = async (req, res, next) => {
  try {
    const rows = await Enrollment.find({ user: req.user._id }).populate("course");
    res.json({ success: true, enrollments: rows });
  } catch (e) { next(e); }
};
