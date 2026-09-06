import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import mongoose from "mongoose";

const PORT = process.env.PORT || 5000;

// Start HTTP independently of MongoDB so a temporary database/network outage
// does not make the API appear completely down. Database-backed routes return
// a clear 503 response until the connection is restored.
mongoose.set("bufferCommands", false);

const server = app.listen(PORT, () => {
  console.log(`SkillTrack API running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Set a different PORT in server/.env and restart.`);
  } else {
    console.error("HTTP server failed to start:", error.message);
  }
  process.exit(1);
});

const retryDelayMs = 10_000;

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection unavailable:", error.message);
    console.error(`The API is running in degraded mode; retrying MongoDB in ${retryDelayMs / 1000} seconds.`);
    setTimeout(connectToDatabase, retryDelayMs);
  }
};

if (!process.env.MONGO_URI) {
  console.error("MongoDB is not configured: set MONGO_URI in server/.env");
} else {
  connectToDatabase();
}
