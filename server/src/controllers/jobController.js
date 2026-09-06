import JobApplication from "../models/JobApplication.js";

export const listJobs = async (req, res, next) => {
  try {
    const jobs = await JobApplication.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, jobs });
  } catch (e) { next(e); }
};

export const createJob = async (req, res, next) => {
  try {
    const job = await JobApplication.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, job });
  } catch (e) { next(e); }
};

export const updateJob = async (req, res, next) => {
  try {
    const job = await JobApplication.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, req.body, { new: true }
    );
    if (!job) { res.status(404); throw new Error("Application not found"); }
    res.json({ success: true, job });
  } catch (e) { next(e); }
};

export const deleteJob = async (req, res, next) => {
  try {
    await JobApplication.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (e) { next(e); }
};
