import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import JobApplication from "../models/JobApplication.js";

export const stats = async (_req, res, next) => {
  try {
    const [users, courses, enrollments, applications] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      JobApplication.countDocuments()
    ]);
    res.json({ success: true, stats: { users, courses, enrollments, applications } });
  } catch (e) { next(e); }
};
