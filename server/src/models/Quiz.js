import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: Number
}, { _id: true });

const quizSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  title: String,
  questions: [questionSchema]
}, { timestamps: true });

export default mongoose.model("Quiz", quizSchema);
