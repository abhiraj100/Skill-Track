import Enrollment from "../models/Enrollment.js";
import StudySession from "../models/StudySession.js";
import StudyNote from "../models/StudyNote.js";
import MindGameAttempt from "../models/MindGameAttempt.js";
import QuizAttempt from "../models/QuizAttempt.js";
import JobApplication from "../models/JobApplication.js";

const badge = (id, title, description, icon, value, target) => ({
  id, title, description, icon, value: Math.min(value, target), target,
  unlocked: value >= target
});

export const getAchievements = async (req, res, next) => {
  try {
    const user = req.user._id;
    const [enrolled, completed, studyMinutes, notes, games, jobs, quizAce] = await Promise.all([
      Enrollment.countDocuments({ user }),
      Enrollment.countDocuments({ user, progress: 100 }),
      StudySession.aggregate([{ $match: { user } }, { $group: { _id: null, total: { $sum: "$minutes" } } }]),
      StudyNote.countDocuments({ user }),
      MindGameAttempt.countDocuments({ user }),
      JobApplication.countDocuments({ user }),
      QuizAttempt.exists({ user, $expr: { $gte: [{ $divide: ["$score", { $max: ["$total", 1] }] }, 0.8] } })
    ]);
    const badges = [
      badge("explorer", "First step", "Enroll in your first course.", "🚀", enrolled, 1),
      badge("focused", "Focus builder", "Log 150 minutes of study time.", "⏱️", studyMinutes, 150),
      badge("notebook", "Note collector", "Create 3 study notes.", "📝", notes, 3),
      badge("finisher", "Course finisher", "Complete your first course.", "🎓", completed, 1),
      badge("quiz", "Quiz ace", "Score 80% or higher on a quiz.", "🧠", quizAce ? 1 : 0, 1),
      badge("mind", "Mind athlete", "Finish 3 Mind Gym rounds.", "⚡", games, 3),
      badge("career", "Career starter", "Track your first application.", "💼", jobs, 1)
    ];
    res.json({ success: true, badges, unlocked: badges.filter((item) => item.unlocked).length, total: badges.length });
  } catch (e) { next(e); }
};
