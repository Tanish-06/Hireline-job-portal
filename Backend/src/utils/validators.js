import { z } from "zod";

const skillsField = z
  .union([z.array(z.string()), z.string()])
  .transform((v) =>
    Array.isArray(v)
      ? v.map((s) => s.trim()).filter(Boolean)
      : v.split(",").map((s) => s.trim()).filter(Boolean)
  );

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["jobseeker", "recruiter"]).default("jobseeker"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const jobSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z.string().trim().min(20, "Description must be at least 20 characters"),
  companyName: z.string().trim().min(2, "Company name is required"),
  location: z.string().trim().min(2, "Location is required"),
  jobType: z.enum(["full-time", "part-time", "internship", "contract", "remote"]),
  salary: z.coerce.number().min(0).optional(), // annual salary in LPA
  skills: skillsField.optional(),
});

export const updateJobSchema = jobSchema.partial();

export const applicationStatusSchema = z.object({
  status: z.enum(["applied", "shortlisted", "rejected", "hired"]),
});
