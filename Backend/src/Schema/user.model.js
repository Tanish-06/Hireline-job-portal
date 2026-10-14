import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["jobseeker", "recruiter"], default: "jobseeker" },
    profile: {
      bio: { type: String, default: "" },
      skills: { type: [String], default: [] },
      location: { type: String, default: "" },
      resumeUrl: { type: String, default: "" },
      // recruiter only
      companyName: { type: String, default: "" },
      companyWebsite: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// hash the password before saving (only if it changed)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model("User", userSchema);
