import mongoose from "mongoose";

const interviewQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  topic: { type: String, default: "General" },
  userAnswer: { type: String, default: "" },
  score: { type: Number, default: 0 },
  feedback: { type: String, default: "" },
  strengths: [{ type: String }],
  improvements: [{ type: String }],
  idealAnswer: { type: String, default: "" },
  starBreakdown: {
    situationScore: { type: Number, default: 75 },
    taskScore: { type: Number, default: 75 },
    actionScore: { type: Number, default: 75 },
    resultScore: { type: Number, default: 70 },
    starSummary: { type: String, default: "" }
  }
});

const interviewSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, required: true },
  interviewType: { type: String, default: "Technical & Behavioral" },
  difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Intermediate" },
  overallScore: { type: Number, default: 0 },
  clarityScore: { type: Number, default: 0 },
  technicalScore: { type: Number, default: 0 },
  problemSolvingScore: { type: Number, default: 0 },
  summaryFeedback: { type: String, default: "" },
  questions: [interviewQuestionSchema],
  status: { type: String, enum: ["in-progress", "completed"], default: "in-progress" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("InterviewSession", interviewSessionSchema);
