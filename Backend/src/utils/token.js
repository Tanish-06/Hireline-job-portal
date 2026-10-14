import jwt from "jsonwebtoken";

const isProd = process.env.NODE_ENV === "production";

export const cookieOptions = {
  httpOnly: true, // JS in the browser can't read it (protects against XSS theft)
  secure: isProd, // https only in production
  sameSite: isProd ? "none" : "lax", // "none" is needed when frontend & backend are on different domains
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const sendToken = (res, user, statusCode = 200) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
};
