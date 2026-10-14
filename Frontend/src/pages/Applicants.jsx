import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { getErrorMessage, fileUrl } from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import Alert from "../components/Alert";

export default function Applicants() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/applications/job/${id}`)
      .then((res) => {
        setJob(res.data.job);
        setApplications(res.data.applications);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const changeStatus = async (appId, status) => {
    try {
      await api.patch(`/applications/${appId}/status`, { status });
      setApplications((prev) => prev.map((a) => (a._id === appId ? { ...a, status } : a)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <p className="py-10 text-center text-muted">Loading…</p>;

  return (
    <div>
      <Link to="/recruiter/dashboard" className="text-sm text-muted hover:text-brand">Back to dashboard</Link>
      <h1 className="mt-3 text-3xl font-bold">Applicants{job && ` for ${job.title}`}</h1>
      <div className="mt-4"><Alert>{error}</Alert></div>

      {applications.length === 0 ? (
        <p className="mt-6 text-muted">No one has applied yet.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {applications.map((a) => (
            <li key={a._id} className="rounded-lg border border-line bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold">{a.applicant.name}</p>
                  <p className="text-sm text-muted">{a.applicant.email}</p>
                  {a.applicant.profile?.skills?.length > 0 && (
                    <p className="mt-1 text-sm">Skills: {a.applicant.profile.skills.join(", ")}</p>
                  )}
                </div>
                <StatusBadge status={a.status} />
              </div>

              {a.coverLetter && <p className="mt-3 whitespace-pre-line text-sm">{a.coverLetter}</p>}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a className="btn-outline" href={fileUrl(a.resumeUrl)} target="_blank" rel="noreferrer">View resume</a>
                <label className="flex items-center gap-2 text-sm">
                  Status
                  <select className="input !w-auto" value={a.status} onChange={(e) => changeStatus(a._id, e.target.value)}>
                    <option value="applied">Applied</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                    <option value="hired">Hired</option>
                  </select>
                </label>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
