import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import StudySession from "../models/StudySession.js";

const dateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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

export const getStudySummary = async (req, res, next) => {
  try {
    const days = Array.from({ length: 7 }, (_, index) => {
      const day = new Date();
      day.setDate(day.getDate() - (6 - index));
      return dateKey(day);
    });
    const sessions = await StudySession.find({ user: req.user._id, date: { $in: days } }).lean();
    const minutesByDate = new Map(sessions.map((session) => [session.date, session.minutes]));
    const weekly = days.map((date) => ({ date, minutes: minutesByDate.get(date) || 0 }));
    let streak = 0;
    for (let index = 6; index >= 0; index -= 1) {
      if (weekly[index].minutes > 0) streak += 1;
      else if (index !== 6 || weekly[index].date !== dateKey(new Date())) break;
    }
    res.json({ success: true, dailyGoal: req.user.dailyGoal || 30, todayMinutes: weekly.at(-1).minutes, streak, weekly });
  } catch (e) { next(e); }
};

export const logStudyTime = async (req, res, next) => {
  try {
    const minutes = Number(req.body.minutes);
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 240) { res.status(400); throw new Error("Minutes must be a whole number between 1 and 240"); }
    const date = dateKey(new Date());
    let session = await StudySession.findOne({ user: req.user._id, date });
    if (!session) session = new StudySession({ user: req.user._id, date, minutes: 0 });
    session.minutes = Math.min(session.minutes + minutes, 1440);
    await session.save();
    res.json({ success: true, session });
  } catch (e) { next(e); }
};
