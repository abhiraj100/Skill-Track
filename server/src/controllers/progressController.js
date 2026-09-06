import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";

export const completeLesson = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.body;
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (!enrollment) { res.status(404); throw new Error("Enroll in this course first"); }

    if (!enrollment.completedLessons.some(id => id.toString() === lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }

    const course = await Course.findById(courseId);
    enrollment.progress = Math.round((enrollment.completedLessons.length / Math.max(course.lessons.length, 1)) * 100);
    enrollment.lastLesson = lessonId;
    await enrollment.save();

    res.json({ success: true, enrollment });
  } catch (e) { next(e); }
};

export const getProgress = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: req.params.courseId });
    res.json({ success: true, enrollment });
  } catch (e) { next(e); }
};
