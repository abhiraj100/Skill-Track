import mongoose from "mongoose";

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  company: { type: String, required: true },
  position: { type: String, required: true },
  jobUrl: String,
  status: { type: String, enum: ["Applied", "Assessment", "Interview", "Offer", "Rejected"], default: "Applied" },
  appliedDate: { type: Date, default: Date.now },
  interviewDate: Date,
  notes: String
}, { timestamps: true });

export default mongoose.model("JobApplication", schema);
