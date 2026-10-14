import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import Alert from "../components/Alert";

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () =>
    api.get("/jobs/mine/list")
      .then((res) => setJobs(res.data.jobs))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job and all its applications?")) return;
    try {
      await api.delete(`/jobs/${id}`);
      setJobs((prev) => prev.filter((j) => j._id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const totalApplicants = jobs.reduce((sum, j) => sum + j.applicantCount, 0);

  if (loading) return <p className="py-10 text-center text-muted">Loading…</p>;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Your job posts</h1>
          <p className="mt-1 text-muted">{jobs.length} posted · {totalApplicants} applicants in total</p>
        </div>
        <Link to="/recruiter/jobs/new" className="btn">Post a job</Link>
      </div>

      <div className="mt-4"><Alert>{error}</Alert></div>

      {jobs.length === 0 ? (
        <p className="mt-8 text-muted">You haven't posted any jobs yet. Post your first one to start receiving applications.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {jobs.map((job) => (
            <li key={job._id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-white p-4">
              <div>
                <Link to={`/jobs/${job._id}`} className="font-display text-lg font-bold hover:text-brand">{job.title}</Link>
                <p className="text-sm text-muted">{job.location} · {job.jobType}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link to={`/recruiter/jobs/${job._id}/applicants`} className="btn-outline">
                  {job.applicantCount} applicant{job.applicantCount !== 1 && "s"}
                </Link>
                <Link to={`/recruiter/jobs/${job._id}/edit`} className="btn-outline">Edit</Link>
                <button onClick={() => handleDelete(job._id)} className="btn-outline !text-red-700 hover:!border-red-700">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
