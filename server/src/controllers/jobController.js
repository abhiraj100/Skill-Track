import JobApplication from "../models/JobApplication.js";

export const listJobs = async (req, res, next) => {
  try {
    const jobs = await JobApplication.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, jobs });
  } catch (e) { next(e); }
};

export const createJob = async (req, res, next) => {
  try {
    const { company, position, status, jobUrl, notes, appliedDate, interviewDate } = req.body;
    if (!company?.trim() || !position?.trim()) { res.status(400); throw new Error("Company and position are required"); }
    const job = await JobApplication.create({ company: company.trim(), position: position.trim(), status, jobUrl, notes, appliedDate, interviewDate, user: req.user._id });
    res.status(201).json({ success: true, job });
  } catch (e) { next(e); }
};

export const updateJob = async (req, res, next) => {
  try {
    const allowed = ["company", "position", "status", "jobUrl", "notes", "appliedDate", "interviewDate"];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    const job = await JobApplication.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, updates, { new: true, runValidators: true }
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
