import InterviewSession from "../models/InterviewSession.js";

export const getInterviewHistory = async (req, res, next) => {
  try {
    const sessions = await InterviewSession.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, sessions });
  } catch (error) {
    next(error);
  }
};

export const createInterviewSession = async (req, res, next) => {
  try {
    const { role, interviewType, difficulty, questions } = req.body;
    const session = await InterviewSession.create({
      user: req.user._id,
      role: role || "Fullstack MERN Developer",
      interviewType: interviewType || "Technical & Behavioral",
      difficulty: difficulty || "Intermediate",
      questions: questions || []
    });
    res.status(201).json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

export const updateInterviewSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      questions,
      overallScore,
      clarityScore,
      technicalScore,
      problemSolvingScore,
      summaryFeedback,
      status
    } = req.body;

    const session = await InterviewSession.findOne({ _id: id, user: req.user._id });
    if (!session) {
      return res.status(404).json({ success: false, message: "Interview session not found" });
    }

    if (questions) session.questions = questions;
    if (overallScore !== undefined) session.overallScore = overallScore;
    if (clarityScore !== undefined) session.clarityScore = clarityScore;
    if (technicalScore !== undefined) session.technicalScore = technicalScore;
    if (problemSolvingScore !== undefined) session.problemSolvingScore = problemSolvingScore;
    if (summaryFeedback) session.summaryFeedback = summaryFeedback;
    if (status) session.status = status;

    await session.save();
    res.json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

export const getInterviewSessionById = async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) {
      return res.status(404).json({ success: false, message: "Interview session not found" });
    }
    res.json({ success: true, session });
  } catch (error) {
    next(error);
  }
};
