import jwt from "jsonwebtoken";
import User from "../Schema/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Checks that the request has a valid JWT and attaches the user to req.user
export const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;

  const header = req.headers.authorization;
  if (!token && header?.startsWith("Bearer ")) token = header.split(" ")[1];

  if (!token) throw new ApiError(401, "Please log in to continue");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, "User no longer exists");

  req.user = user;
  next();
});

// Role-based access: authorize("recruiter") etc.
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "You are not allowed to do this"));
    }
    next();
  };
