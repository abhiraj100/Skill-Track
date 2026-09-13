import mongoose from "mongoose";

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  content: { type: String, required: true, trim: true, maxlength: 8000 },
  tags: [{ type: String, trim: true, maxlength: 30 }],
  pinned: { type: Boolean, default: false }
}, { timestamps: true });

schema.index({ user: 1, pinned: -1, updatedAt: -1 });

export default mongoose.model("StudyNote", schema);
