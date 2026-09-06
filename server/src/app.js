import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const apiIndex = (_req, res) => {
  res.json({
    success: true,
    message: "SkillTrack API is running",
    health: "/api/health",
    endpoints: ["/api/auth", "/api/courses", "/api/progress", "/api/quizzes", "/api/jobs", "/api/ai", "/api/admin"]
  });
};

app.get("/", apiIndex);
app.get("/api", apiIndex);

app.get("/api/health", (_req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.status(databaseConnected ? 200 : 503).json({
    success: databaseConnected,
    message: databaseConnected
      ? "SkillTrack API and MongoDB are healthy"
      : "SkillTrack API is running, but MongoDB is unavailable",
    database: databaseConnected ? "connected" : "unavailable"
  });
});

app.use("/api", (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  res.status(503).json({
    success: false,
    message: "Database is unavailable. Check MONGO_URI and MongoDB network access."
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
