import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import JobApplication from "../models/JobApplication.js";

export const stats = async (_req, res, next) => {
  try {
    const [users, courses, enrollments, applications, completedEnrollments, applicationsByStatus] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      JobApplication.countDocuments(),
      Enrollment.countDocuments({ progress: 100 }),
      JobApplication.aggregate([{ $group: { _id: "$status", value: { $sum: 1 } } }])
    ]);
    res.json({ success: true, stats: {
      users, courses, enrollments, applications, completedEnrollments,
      completionRate: enrollments ? Math.round(completedEnrollments / enrollments * 100) : 0,
      applicationsByStatus: applicationsByStatus.map((row) => ({ name: row._id, value: row.value }))
    } });
  } catch (e) { next(e); }
};
