import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Quiz from "../models/Quiz.js";
import JobApplication from "../models/JobApplication.js";
import Skill from "../models/Skill.js";

await mongoose.connect(process.env.MONGO_URI);

await Promise.all([
  User.deleteMany({}), Course.deleteMany({}), Quiz.deleteMany({}),
  JobApplication.deleteMany({}), Skill.deleteMany({})
]);

const passwordUser = await bcrypt.hash("User@123", 12);
const passwordAdmin = await bcrypt.hash("Admin@123", 12);

const user = await User.create({
  name: "Abhiraj Yadav",
  email: "user@skilltrack.dev",
  password: passwordUser,
  role: "user",
  careerGoal: "MERN Stack Developer",
  skills: ["React", "JavaScript", "Node.js", "MongoDB", "Git"]
});

await User.create({
  name: "SkillTrack Admin",
  email: "admin@skilltrack.dev",
  password: passwordAdmin,
  role: "admin",
  careerGoal: "Platform Administrator",
  skills: ["React", "Node.js", "MongoDB"]
});

const courseData = [
  {
    title: "MERN Stack Foundations",
    description: "Build a strong foundation across React, Node.js, Express and MongoDB.",
    category: "Web Development",
    difficulty: "Beginner",
    duration: "8h 20m",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
    skills: ["React", "Node.js", "Express.js", "MongoDB"],
    instructor: "SkillTrack Academy",
    lessons: [
      { title: "How the MERN stack fits together", duration: "18 min", content: "Understand the architecture and request lifecycle.", order: 1 },
      { title: "React fundamentals", duration: "42 min", content: "Components, props, state and composition.", order: 2 },
      { title: "Express REST APIs", duration: "45 min", content: "Routes, controllers, middleware and validation.", order: 3 },
      { title: "MongoDB with Mongoose", duration: "50 min", content: "Schemas, models, queries and relationships.", order: 4 }
    ]
  },
  {
    title: "Advanced React & State Management",
    description: "Build scalable React interfaces with reusable architecture and predictable state.",
    category: "Frontend",
    difficulty: "Intermediate",
    duration: "6h 45m",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80",
    skills: ["React", "TypeScript", "Redux Toolkit"],
    instructor: "SkillTrack Academy",
    lessons: [
      { title: "Component architecture", duration: "30 min", content: "Design maintainable component boundaries.", order: 1 },
      { title: "Redux Toolkit", duration: "55 min", content: "Slices, selectors, async state and normalized data.", order: 2 },
      { title: "Performance patterns", duration: "38 min", content: "Memoization, lazy loading and render optimization.", order: 3 },
      { title: "Responsive UI systems", duration: "45 min", content: "Mobile-first layouts and accessible interaction.", order: 4 }
    ]
  },
  {
    title: "Node.js API Engineering",
    description: "Design production-minded Express APIs with authentication, validation and error handling.",
    category: "Backend",
    difficulty: "Advanced",
    duration: "9h 10m",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80",
    skills: ["Node.js", "Express.js", "REST APIs", "JWT"],
    instructor: "SkillTrack Academy",
    lessons: [
      { title: "API architecture", duration: "36 min", content: "Controllers, services, middleware and clean boundaries.", order: 1 },
      { title: "JWT authentication", duration: "49 min", content: "Access tokens, authorization and secure flows.", order: 2 },
      { title: "Validation and errors", duration: "41 min", content: "Predictable API responses and validation patterns.", order: 3 },
      { title: "Production deployment", duration: "52 min", content: "Environment variables, logging and deployment basics.", order: 4 }
    ]
  }
];

const courses = await Course.insertMany(courseData);

await Quiz.create({
  course: courses[0]._id,
  title: "MERN Foundations Quiz",
  questions: [
    { question: "Which database is commonly used in MERN?", options: ["MongoDB", "MySQL", "PostgreSQL", "Redis"], correctAnswer: 0 },
    { question: "Which library is used for the frontend?", options: ["Express", "React", "Mongoose", "Node"], correctAnswer: 1 },
    { question: "Which runtime powers the backend JavaScript?", options: ["Node.js", "Vite", "MongoDB", "Tailwind"], correctAnswer: 0 }
  ]
});

await JobApplication.insertMany([
  { user: user._id, company: "Nova Labs", position: "MERN Developer", status: "Interview", appliedDate: new Date("2026-08-12") },
  { user: user._id, company: "Orbit Systems", position: "Software Engineer", status: "Applied", appliedDate: new Date("2026-08-20") },
  { user: user._id, company: "PixelForge", position: "Frontend Engineer", status: "Assessment", appliedDate: new Date("2026-08-24") }
]);

await Skill.insertMany(["React","JavaScript","TypeScript","Node.js","Express.js","MongoDB","REST APIs","Docker","AWS","Testing","System Design","Git"].map(name => ({ name })));

console.log("Seed complete.");
console.log("User: user@skilltrack.dev / User@123");
console.log("Admin: admin@skilltrack.dev / Admin@123");
await mongoose.disconnect();
