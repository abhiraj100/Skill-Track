import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";

export const completeLesson = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.body;
    if (!courseId || !lessonId) { res.status(400); throw new Error("courseId and lessonId are required"); }
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (!enrollment) { res.status(404); throw new Error("Enroll in this course first"); }

    if (!enrollment.completedLessons.some(id => id.toString() === lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }

    const course = await Course.findById(courseId);
    if (!course || !course.lessons.some((lesson) => lesson._id.toString() === lessonId)) {
      res.status(404); throw new Error("Lesson not found in this course");
    }
    enrollment.progress = Math.round((enrollment.completedLessons.length / Math.max(course.lessons.length, 1)) * 100);
    enrollment.lastLesson = lessonId;
    await enrollment.save();

    res.json({ success: true, enrollment });
  } catch (e) { next(e); }
};

export const toggleLesson = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.body;
    if (!courseId || !lessonId) { res.status(400); throw new Error("courseId and lessonId are required"); }
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (!enrollment) { res.status(404); throw new Error("Enroll in this course first"); }
    const course = await Course.findById(courseId);
    if (!course || !course.lessons.some((lesson) => lesson._id.toString() === lessonId)) {
      res.status(404); throw new Error("Lesson not found in this course");
    }

    const completedIndex = enrollment.completedLessons.findIndex((id) => id.toString() === lessonId);
    const completed = completedIndex === -1;
    if (completed) enrollment.completedLessons.push(lessonId);
    else enrollment.completedLessons.splice(completedIndex, 1);

    enrollment.progress = Math.round((enrollment.completedLessons.length / Math.max(course.lessons.length, 1)) * 100);
    enrollment.lastLesson = completed ? lessonId : enrollment.completedLessons.at(-1) || undefined;
    await enrollment.save();
    res.json({ success: true, completed, enrollment });
  } catch (e) { next(e); }
};

export const getProgress = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: req.params.courseId });
    res.json({ success: true, enrollment });
  } catch (e) { next(e); }
};
