// Run with: npm run seed   (creates a demo recruiter + sample jobs for screenshots)
import "dotenv/config";
import mongoose from "mongoose";
import User from "./Schema/user.model.js";
import Job from "./Schema/job.model.js";
import Application from "./Schema/application.model.js";

await mongoose.connect(process.env.MONGODB_URI);

await Promise.all([User.deleteMany({}), Job.deleteMany({}), Application.deleteMany({})]);

const recruiter = await User.create({
  name: "Demo Recruiter",
  email: "recruiter@demo.com",
  password: "demo1234",
  role: "recruiter",
  profile: { companyName: "Demo Technologies" },
});
await User.create({
  name: "Demo Candidate",
  email: "candidate@demo.com",
  password: "demo1234",
  role: "jobseeker",
  profile: { skills: ["React", "Node.js"], location: "Nagpur" },
});

const sample = [
  ["MERN Stack Developer", "Demo Technologies", "Nagpur", "full-time", 6, ["React", "Node.js", "MongoDB"]],
  ["Frontend Intern", "PixelWorks", "Remote", "internship", 1.2, ["React", "Tailwind"]],
  ["Backend Engineer", "CloudNest", "Pune", "full-time", 9, ["Node.js", "Express", "AWS"]],
  ["UI Developer", "Designly", "Mumbai", "contract", 5, ["HTML", "CSS", "JavaScript"]],
  ["Full Stack Developer", "StartupHub", "Bengaluru", "remote", 12, ["React", "Node.js", "PostgreSQL"]],
  ["Junior Web Developer", "Webify", "Nagpur", "part-time", 3, ["JavaScript", "React"]],
  ["Data Analyst", "Insightly", "Hyderabad", "full-time", 7, ["SQL", "Python", "Power BI"]],
  ["DevOps Intern", "InfraLabs", "Remote", "internship", 1.5, ["Docker", "Linux", "CI/CD"]],
];

for (const [title, companyName, location, jobType, salary, skills] of sample) {
  await Job.create({
    title, companyName, location, jobType, salary, skills,
    description: `We are looking for a ${title} to join ${companyName}. You will build and ship features used by real customers, work closely with a small team, and grow quickly.`,
    postedBy: recruiter._id,
  });
}

console.log("Seeded. Logins: recruiter@demo.com / demo1234  |  candidate@demo.com / demo1234");
await mongoose.disconnect();
