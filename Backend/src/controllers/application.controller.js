import Job from "../Schema/job.model.js";
import Application from "../Schema/application.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// POST /api/applications/:jobId  (jobseeker) – multipart: coverLetter, resume (optional PDF)
export const applyToJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job || !job.isActive) throw new ApiError(404, "Job not found");

  // use the resume uploaded now, otherwise fall back to the one saved on the profile
  const resumeUrl = req.file ? `/uploads/${req.file.filename}` : req.user.profile.resumeUrl;
  if (!resumeUrl) throw new ApiError(400, "Please upload a resume (PDF) to apply");

  const application = await Application.create({
    job: job._id,
    applicant: req.user._id,
    coverLetter: req.body.coverLetter || "",
    resumeUrl,
  });

  res.status(201).json({ application });
});

// GET /api/applications/me  (jobseeker)
export const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ applicant: req.user._id })
    .populate("job", "title companyName location jobType")
    .sort({ createdAt: -1 });
  res.json({ applications });
});

// GET /api/applications/job/:jobId  (recruiter who owns the job)
export const getJobApplications = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) throw new ApiError(404, "Job not found");
  if (job.postedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only view applicants of your own jobs");
  }

  const applications = await Application.find({ job: job._id })
    .populate("applicant", "name email profile")
    .sort({ createdAt: -1 });

  res.json({ job, applications });
});

// PATCH /api/applications/:id/status  (recruiter who owns the job)
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate("job", "postedBy");
  if (!application) throw new ApiError(404, "Application not found");
  if (application.job.postedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not allowed");
  }

  application.status = req.body.status;
  await application.save();
  res.json({ application });
});
