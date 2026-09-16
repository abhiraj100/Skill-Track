import mongoose from "mongoose";

const communityPostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  authorName: { type: String, required: true },
  authorGoal: { type: String, default: "Fullstack Developer" },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  category: {
    type: String,
    enum: ["Technical Q&A", "Project Showcase", "Interview Advice", "Study Groups"],
    default: "Technical Q&A"
  },
  tags: [{ type: String, trim: true }],
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  commentsCount: { type: Number, default: 0 },
  hasAcceptedAnswer: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("CommunityPost", communityPostSchema);
