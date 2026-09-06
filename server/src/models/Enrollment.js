import mongoose from "mongoose";

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId }],
  progress: { type: Number, default: 0 },
  lastLesson: { type: mongoose.Schema.Types.ObjectId }
}, { timestamps: true });

schema.index({ user: 1, course: 1 }, { unique: true });
export default mongoose.model("Enrollment", schema);
