import crypto from "crypto";
import Certificate from "../models/Certificate.js";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";

export const getUserCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ user: req.user._id })
      .populate("course", "title thumbnail category duration instructor")
      .sort({ issueDate: -1 });
    res.json({ success: true, certificates });
  } catch (error) {
    next(error);
  }
};

export const claimCertificate = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, message: "Course ID is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Check existing certificate
    const existing = await Certificate.findOne({ user: req.user._id, course: courseId });
    if (existing) {
      return res.json({ success: true, certificate: existing, alreadyClaimed: true });
    }

    // Verify 100% completion in enrollment
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (!enrollment || enrollment.progress < 100) {
      return res.status(400).json({
        success: false,
        message: `Course not completed yet. Current progress: ${enrollment ? enrollment.progress : 0}%. Complete all lessons to earn your certificate.`
      });
    }

    const randomCode = crypto.randomBytes(4).toString("hex").toUpperCase();
    const certificateId = `ST-${new Date().getFullYear()}-${randomCode}`;
    const verificationHash = crypto
      .createHash("sha256")
      .update(`${certificateId}-${req.user._id}-${courseId}-${Date.now()}`)
      .digest("hex");

    const certificate = await Certificate.create({
      certificateId,
      user: req.user._id,
      course: course._id,
      studentName: req.user.name,
      courseTitle: course.title,
      instructor: course.instructor || "SkillTrack Academy",
      skills: course.skills || [],
      grade: "Mastery (100%)",
      issueDate: new Date(),
      verificationHash
    });

    res.status(201).json({ success: true, certificate, alreadyClaimed: false });
  } catch (error) {
    next(error);
  }
};

export const verifyCertificate = async (req, res, next) => {
  try {
    const { query } = req.params;
    const cleanQuery = String(query || "").trim();

    const certificate = await Certificate.findOne({
      $or: [
        { certificateId: cleanQuery.toUpperCase() },
        { verificationHash: cleanQuery.toLowerCase() }
      ]
    }).populate("course", "title category duration instructor thumbnail");

    if (!certificate) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: "No authentic certificate found matching this verification code."
      });
    }

    res.json({
      success: true,
      valid: true,
      certificate: {
        certificateId: certificate.certificateId,
        studentName: certificate.studentName,
        courseTitle: certificate.courseTitle,
        instructor: certificate.instructor,
        skills: certificate.skills,
        grade: certificate.grade,
        issueDate: certificate.issueDate,
        verificationHash: certificate.verificationHash
      }
    });
  } catch (error) {
    next(error);
  }
};
