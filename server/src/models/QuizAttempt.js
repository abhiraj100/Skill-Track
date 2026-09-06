import mongoose from "mongoose";

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  score: Number,
  total: Number,
  answers: [Number]
}, { timestamps: true });

export default mongoose.model("QuizAttempt", schema);
