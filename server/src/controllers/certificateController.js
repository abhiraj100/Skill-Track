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

    // Verify 100% completion in enrollment (or passing knowledge assessment exam in claim sandbox)
    let enrollment = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if ((!enrollment || enrollment.progress < 100) && req.body.examScore && req.body.examScore >= 80) {
      if (!enrollment) {
        enrollment = await Enrollment.create({
          user: req.user._id,
          course: courseId,
          progress: 100,
          completedLessons: []
        });
      } else {
        enrollment.progress = 100;
        await enrollment.save();
      }
    } else if (!enrollment || enrollment.progress < 100) {
      return res.status(400).json({
        success: false,
        message: `Course not completed yet. Current progress: ${enrollment ? enrollment.progress : 0}%. Complete all lessons or pass the knowledge exam to earn your certificate.`
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

export const batchVerifyCertificates = async (req, res, next) => {
  try {
    const { queries = [] } = req.body;
    if (!Array.isArray(queries) || queries.length === 0) {
      return res.status(400).json({ success: false, message: "Provide an array of certificate IDs or hashes" });
    }

    const cleanQueries = queries.map((q) => String(q).trim()).filter(Boolean);
    const upperQueries = cleanQueries.map((q) => q.toUpperCase());
    const lowerQueries = cleanQueries.map((q) => q.toLowerCase());

    const matchedCertificates = await Certificate.find({
      $or: [
        { certificateId: { $in: upperQueries } },
        { verificationHash: { $in: lowerQueries } }
      ]
    }).populate("course", "title category instructor duration");

    // Compute Merkle Root across the batch
    const leafHashes = matchedCertificates.map((c) =>
      crypto.createHash("sha256").update(`${c.certificateId}:${c.verificationHash}:${c.issueDate}`).digest("hex")
    );

    let merkleRoot = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    if (leafHashes.length > 0) {
      merkleRoot = leafHashes.reduce((acc, h) =>
        crypto.createHash("sha256").update(acc + h).digest("hex")
      );
    }

    res.json({
      success: true,
      batchSize: queries.length,
      matchedCount: matchedCertificates.length,
      merkleRoot,
      verificationAuthority: "SkillTrack Enterprise Cryptographic CA",
      verifiedAt: new Date().toISOString(),
      certificates: matchedCertificates.map((c) => ({
        certificateId: c.certificateId,
        studentName: c.studentName,
        courseTitle: c.courseTitle,
        grade: c.grade,
        issueDate: c.issueDate,
        verificationHash: c.verificationHash
      }))
    });
  } catch (error) {
    next(error);
  }
};
