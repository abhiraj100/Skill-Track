import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import app from "../server/src/app.js";

let isConnected = false;

async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }
  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        bufferCommands: false
      });
      isConnected = true;
    } catch (err) {
      console.error("MongoDB Serverless Connection Error:", err.message);
    }
  }
}

export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}
