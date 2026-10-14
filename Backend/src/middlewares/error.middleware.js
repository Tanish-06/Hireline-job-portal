import { ZodError } from "zod";
import multer from "multer";

export const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// one place that turns every kind of error into a clean JSON response
export const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  if (err instanceof ZodError) {
    status = 400;
    message = err.issues.map((i) => i.message).join(", ");
  } else if (err instanceof multer.MulterError) {
    status = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "File is too large (max 2 MB)" : err.message;
  } else if (err.code === 11000) {
    status = 409;
    message = err.keyPattern?.email
      ? "An account with this email already exists"
      : "You have already applied to this job";
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid id";
  } else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    status = 401;
    message = "Session expired. Please log in again";
  }

  if (status === 500) console.error(err);
  res.status(status).json({ message });
};
