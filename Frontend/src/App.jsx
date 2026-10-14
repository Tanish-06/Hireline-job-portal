import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import JobDetail from "./pages/JobDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import MyApplications from "./pages/MyApplications";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import JobForm from "./pages/JobForm";
import Applicants from "./pages/Applicants";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Routes>
          {/* public */}
          <Route path="/" element={<Home />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* any logged-in user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* job seekers only */}
          <Route element={<ProtectedRoute roles={["jobseeker"]} />}>
            <Route path="/my-applications" element={<MyApplications />} />
          </Route>

          {/* recruiters only */}
          <Route element={<ProtectedRoute roles={["recruiter"]} />}>
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/recruiter/jobs/new" element={<JobForm />} />
            <Route path="/recruiter/jobs/:id/edit" element={<JobForm />} />
            <Route path="/recruiter/jobs/:id/applicants" element={<Applicants />} />
          </Route>

          <Route path="*" element={<p className="py-20 text-center text-muted">Page not found.</p>} />
        </Routes>
      </main>
    </>
  );
}
