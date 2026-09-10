import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  careerGoal: { type: String, default: "Full Stack Developer" },
  dailyGoal: { type: Number, default: 30, min: 5, max: 480 },
  skills: [{ type: String }],
  avatar: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
