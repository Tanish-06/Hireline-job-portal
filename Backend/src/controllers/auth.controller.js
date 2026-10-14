import User from "../Schema/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendToken, cookieOptions } from "../utils/token.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({ name, email, password, role });
  sendToken(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }
  sendToken(res, user);
});

export const logout = asyncHandler(async (req, res) => {
  res
    .clearCookie("token", { ...cookieOptions, maxAge: undefined })
    .json({ message: "Logged out" });
});

// returns the currently logged-in user (used by the frontend on page load)
export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
