import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const register = async (req, res, next) => {
  try {
    const { name, email, password, careerGoal } = req.body;
    if (!name || !email || !password) {
      res.status(400); throw new Error("Name, email and password are required");
    }
    if (password.length < 6) {
      res.status(400); throw new Error("Password must contain at least 6 characters");
    }
    const exists = await User.findOne({ email });
    if (exists) { res.status(409); throw new Error("Email already registered"); }

    const user = await User.create({
      name, email, careerGoal: careerGoal || "Full Stack Developer",
      password: await bcrypt.hash(password, 12)
    });

    res.status(201).json({
      success: true,
      token: signToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, careerGoal: user.careerGoal, dailyGoal: user.dailyGoal, skills: user.skills }
    });
  } catch (e) { next(e); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401); throw new Error("Invalid email or password");
    }
    res.json({
      success: true,
      token: signToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, careerGoal: user.careerGoal, dailyGoal: user.dailyGoal, skills: user.skills }
    });
  } catch (e) { next(e); }
};

export const me = async (req, res) => {
  res.json({ success: true, user: req.user });
};

export const updateProfile = async (req, res, next) => {
  try {
    const dailyGoal = Number(req.body.dailyGoal);
    if (!req.body.name?.trim()) { res.status(400); throw new Error("Name is required"); }
    if (!Number.isInteger(dailyGoal) || dailyGoal < 5 || dailyGoal > 480) {
      res.status(400); throw new Error("Daily learning goal must be between 5 and 480 minutes");
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: req.body.name.trim(), careerGoal: req.body.careerGoal, dailyGoal, skills: req.body.skills || [] },
      { new: true, runValidators: true }
    ).select("-password");
    res.json({ success: true, user });
  } catch (e) { next(e); }
};
