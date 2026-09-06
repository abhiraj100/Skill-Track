import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  title: String,
  duration: String,
  content: String,
  order: Number
}, { _id: true });

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"] },
  duration: String,
  thumbnail: String,
  skills: [String],
  instructor: String,
  lessons: [lessonSchema]
}, { timestamps: true });

export default mongoose.model("Course", courseSchema);
