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
import scaleRoutes from "./routes/scaleRoutes.js";
import queueRoutes from "./routes/queueRoutes.js";
import iamRoutes from "./routes/iamRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import chaosRoutes from "./routes/chaosRoutes.js";
import { telemetryMiddleware, rateLimiter } from "./middleware/telemetryMiddleware.js";
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
    if (!origin) return callback(null, true);
    if (
      configuredOrigins.includes("*") ||
      configuredOrigins.includes(origin) ||
      isLocalDevelopmentOrigin(origin) ||
      isVercelOrigin(origin)
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Correlation-ID", "X-Trace-ID", "Idempotency-Key"],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "5mb" }));
app.use(telemetryMiddleware);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Enterprise OpenMetrics / Prometheus Scrape Endpoint
app.get("/api/metrics", (_req, res) => {
  const memory = process.memoryUsage();
  const uptime = Math.floor(process.uptime());
  const dbConnected = mongoose.connection.readyState === 1 ? 1 : 0;

  res.setHeader("Content-Type", "text/plain; version=0.0.4");
  res.send(
`# HELP node_memory_heap_used_bytes V8 heap memory used
# TYPE node_memory_heap_used_bytes gauge
node_memory_heap_used_bytes ${memory.heapUsed}
# HELP node_memory_heap_total_bytes V8 heap memory total
# TYPE node_memory_heap_total_bytes gauge
node_memory_heap_total_bytes ${memory.heapTotal}
# HELP node_memory_rss_bytes Process resident set size
# TYPE node_memory_rss_bytes gauge
node_memory_rss_bytes ${memory.rss}
# HELP process_uptime_seconds Process uptime in seconds
# TYPE process_uptime_seconds counter
process_uptime_seconds ${uptime}
# HELP mongodb_connected MongoDB connection state (1=connected, 0=disconnected)
# TYPE mongodb_connected gauge
mongodb_connected ${dbConnected}
`
  );
});

// Enterprise Kubernetes Liveness & Readiness Probes
app.get("/api/health/live", (_req, res) => {
  res.status(200).json({ status: "ALIVE", timestamp: new Date().toISOString() });
});

app.get("/api/health/ready", (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({
    status: ready ? "READY" : "NOT_READY",
    database: ready ? "connected" : "unavailable",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health/deep", async (_req, res) => {
  const startPing = Date.now();
  let dbPingMs = -1;
  let dbHealthy = false;

  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    try {
      await mongoose.connection.db.admin().ping();
      dbPingMs = Date.now() - startPing;
      dbHealthy = true;
    } catch {
      dbHealthy = false;
    }
  }

  const memory = process.memoryUsage();
  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? "OPTIMAL" : "DEGRADED",
    dbPingMs,
    memory: {
      heapUsedMb: (memory.heapUsed / 1024 / 1024).toFixed(2),
      heapTotalMb: (memory.heapTotal / 1024 / 1024).toFixed(2),
      rssMb: (memory.rss / 1024 / 1024).toFixed(2)
    },
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

const apiIndex = (_req, res) => {
  res.json({
    success: true,
    message: "SkillTrack Enterprise High-Concurrency API is running",
    health: "/api/health",
    metrics: "/api/metrics",
    probes: {
      liveness: "/api/health/live",
      readiness: "/api/health/ready",
      deep: "/api/health/deep"
    },
    endpoints: [
      "/api/auth",
      "/api/courses",
      "/api/progress",
      "/api/quizzes",
      "/api/jobs",
      "/api/ai",
      "/api/admin",
      "/api/mind-games",
      "/api/notes",
      "/api/achievements",
      "/api/interviews",
      "/api/certificates",
      "/api/community",
      "/api/scale",
      "/api/queue",
      "/api/iam",
      "/api/events",
      "/api/chaos"
    ]
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

// Protect all /api endpoints with sliding-window high-concurrency rate limiter
app.use("/api", rateLimiter({ windowMs: 60000, maxRequests: 300 }));

app.use("/api", (req, res, next) => {
  if (
    req.path.startsWith("/scale") ||
    req.path.startsWith("/queue") ||
    req.path.startsWith("/iam") ||
    req.path.startsWith("/events") ||
    req.path.startsWith("/chaos") ||
    req.path.startsWith("/health") ||
    req.path === "/metrics"
  ) {
    return next();
  }
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
app.use("/api/scale", scaleRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/iam", iamRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/chaos", chaosRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
