import mongoose from "mongoose";

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  minutes: { type: Number, default: 0, min: 0, max: 1440 }
}, { timestamps: true });

schema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("StudySession", schema);
