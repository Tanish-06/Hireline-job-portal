import User from "../Schema/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// PUT /api/users/profile – multipart form (so a resume PDF can be sent too)
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, bio, skills, location, companyName, companyWebsite } = req.body;

  if (name?.trim()) user.name = name.trim();
  if (bio !== undefined) user.profile.bio = bio;
  if (location !== undefined) user.profile.location = location;
  if (skills !== undefined) {
    user.profile.skills = skills.split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (user.role === "recruiter") {
    if (companyName !== undefined) user.profile.companyName = companyName;
    if (companyWebsite !== undefined) user.profile.companyWebsite = companyWebsite;
  }
  if (req.file) user.profile.resumeUrl = `/uploads/${req.file.filename}`;

  await user.save();
  res.json({ user });
});
