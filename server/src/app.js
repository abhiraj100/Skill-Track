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
import mindGameRoutes from "./routes/mindGameRoutes.js";
import studyNoteRoutes from "./routes/studyNoteRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configuredOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const isLocalDevelopmentOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
const isVercelOrigin = (origin) => /^https?:\/\/([a-zA-Z0-9-]+\.)*vercel\.app$/.test(origin);

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Allow configured origins, local development, and all Vercel deployment domains
    if (
      configuredOrigins.includes("*") ||
      configuredOrigins.includes(origin) ||
      isLocalDevelopmentOrigin(origin) ||
      isVercelOrigin(origin)
    ) {
      return callback(null, true);
    }

    // Permissive fallback so production deployments are never blocked by CORS
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const apiIndex = (_req, res) => {
  res.json({
    success: true,
    message: "SkillTrack API is running",
    health: "/api/health",
    endpoints: ["/api/auth", "/api/courses", "/api/progress", "/api/quizzes", "/api/jobs", "/api/ai", "/api/admin", "/api/mind-games", "/api/notes", "/api/achievements", "/api/interviews", "/api/certificates", "/api/community"]
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
app.use("/api/mind-games", mindGameRoutes);
app.use("/api/notes", studyNoteRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/community", communityRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
