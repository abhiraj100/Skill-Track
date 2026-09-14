import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  certificateId: { type: String, required: true, unique: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  studentName: { type: String, required: true },
  courseTitle: { type: String, required: true },
  instructor: { type: String, default: "SkillTrack Academy" },
  skills: [{ type: String }],
  grade: { type: String, default: "Mastery (100%)" },
  issueDate: { type: Date, default: Date.now },
  verificationHash: { type: String, required: true, unique: true }
});

export default mongoose.model("Certificate", certificateSchema);
