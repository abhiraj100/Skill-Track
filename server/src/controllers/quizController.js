import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";

export const getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) { res.status(404); throw new Error("Quiz not found"); }
    res.json({ success: true, quiz });
  } catch (e) { next(e); }
};

export const getCourseQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ course: req.params.courseId }).select("title course questions.question questions.options");
    res.json({ success: true, quiz });
  } catch (e) { next(e); }
};

export const getMyAttempts = async (req, res, next) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user._id, quiz: req.params.id })
      .sort({ createdAt: -1 }).limit(5).select("score total createdAt");
    res.json({ success: true, attempts });
  } catch (e) { next(e); }
};

export const submitQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) { res.status(404); throw new Error("Quiz not found"); }
    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
    if (answers.length !== quiz.questions.length || answers.some((answer) => !Number.isInteger(answer))) {
      res.status(400); throw new Error("Answer every quiz question before submitting");
    }
    const score = quiz.questions.reduce((sum, q, i) => sum + (answers[i] === q.correctAnswer ? 1 : 0), 0);
    const attempt = await QuizAttempt.create({ user: req.user._id, quiz: quiz._id, score, total: quiz.questions.length, answers });
    res.json({ success: true, score, total: quiz.questions.length, percentage: Math.round(score / quiz.questions.length * 100), attempt });
  } catch (e) { next(e); }
};
