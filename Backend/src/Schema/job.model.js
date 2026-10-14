import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    companyName: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "internship", "contract", "remote"],
      required: true,
    },
    salary: { type: Number, default: 0 }, // annual, in LPA
    skills: { type: [String], default: [] },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

jobSchema.index({ createdAt: -1 });

export default mongoose.model("Job", jobSchema);
