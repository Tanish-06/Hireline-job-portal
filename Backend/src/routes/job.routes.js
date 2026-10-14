import { Router } from "express";
import {
  getJobs, getJob, createJob, updateJob, deleteJob, getMyJobs,
} from "../controllers/job.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { jobSchema, updateJobSchema } from "../utils/validators.js";

const router = Router();

router.get("/", getJobs);
// NOTE: "/mine/list" must be declared before "/:id" or Express treats "mine" as an id
router.get("/mine/list", protect, authorize("recruiter"), getMyJobs);
router.get("/:id", getJob);

router.post("/", protect, authorize("recruiter"), validate(jobSchema), createJob);
router.put("/:id", protect, authorize("recruiter"), validate(updateJobSchema), updateJob);
router.delete("/:id", protect, authorize("recruiter"), deleteJob);

export default router;
