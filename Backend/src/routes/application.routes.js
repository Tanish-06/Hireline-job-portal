import { Router } from "express";
import {
  applyToJob, getMyApplications, getJobApplications, updateApplicationStatus,
} from "../controllers/application.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { applicationStatusSchema } from "../utils/validators.js";

const router = Router();

router.use(protect);

router.get("/me", authorize("jobseeker"), getMyApplications);
router.post("/:jobId", authorize("jobseeker"), upload.single("resume"), applyToJob);
router.get("/job/:jobId", authorize("recruiter"), getJobApplications);
router.patch("/:id/status", authorize("recruiter"), validate(applicationStatusSchema), updateApplicationStatus);

export default router;
