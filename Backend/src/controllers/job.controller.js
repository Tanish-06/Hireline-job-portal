import Job from "../Schema/job.model.js";
import Application from "../Schema/application.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/jobs?search=&location=&jobType=&minSalary=&page=&limit=
export const getJobs = asyncHandler(async (req, res) => {
  const { search, location, jobType, minSalary } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 6, 50);

  const filter = { isActive: true };

  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ title: rx }, { companyName: rx }, { skills: rx }];
  }
  if (location) filter.location = new RegExp(escapeRegex(location), "i");
  if (jobType) filter.jobType = jobType;
  if (minSalary) filter.salary = { $gte: Number(minSalary) };

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Job.countDocuments(filter),
  ]);

  res.json({ jobs, page, pages: Math.ceil(total / limit), total });
});

// GET /api/jobs/:id
export const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate("postedBy", "name profile.companyName");
  if (!job) throw new ApiError(404, "Job not found");
  res.json({ job });
});

// POST /api/jobs  (recruiter)
export const createJob = asyncHandler(async (req, res) => {
  const job = await Job.create({ ...req.body, postedBy: req.user._id });
  res.status(201).json({ job });
});

// PUT /api/jobs/:id  (owner recruiter)
export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, "Job not found");
  if (job.postedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only edit your own jobs");
  }
  Object.assign(job, req.body);
  await job.save();
  res.json({ job });
});

// DELETE /api/jobs/:id  (owner recruiter)
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, "Job not found");
  if (job.postedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own jobs");
  }
  await Application.deleteMany({ job: job._id }); // clean up related applications
  await job.deleteOne();
  res.json({ message: "Job deleted" });
});

// GET /api/jobs/mine/list  (recruiter) – own jobs with applicant counts
export const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 }).lean();
  const counts = await Application.aggregate([
    { $match: { job: { $in: jobs.map((j) => j._id) } } },
    { $group: { _id: "$job", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));
  res.json({
    jobs: jobs.map((j) => ({ ...j, applicantCount: countMap[j._id.toString()] || 0 })),
  });
});
