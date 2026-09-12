import mongoose from "mongoose";

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
  score: { type: Number, required: true, min: 0, max: 10000 },
  correct: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 1 },
  duration: { type: Number, required: true, min: 1, max: 180 }
}, { timestamps: true });

schema.index({ user: 1, score: -1 });

export default mongoose.model("MindGameAttempt", schema);
