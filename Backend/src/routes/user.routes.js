import { Router } from "express";
import { updateProfile } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

router.put("/profile", protect, upload.single("resume"), updateProfile);

export default router;
