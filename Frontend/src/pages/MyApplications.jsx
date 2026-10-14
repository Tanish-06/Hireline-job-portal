import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import Alert from "../components/Alert";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/applications/me")
      .then((res) => setApplications(res.data.applications))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="py-10 text-center text-muted">Loading…</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold">My applications</h1>
      <div className="mt-4"><Alert>{error}</Alert></div>

      {applications.length === 0 ? (
        <p className="mt-6 text-muted">
          You haven't applied to anything yet. <Link to="/" className="font-semibold text-brand">Browse jobs</Link>
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {applications.map((a) => (
            <li key={a._id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-white p-4">
              <div>
                {a.job ? (
                  <Link to={`/jobs/${a.job._id}`} className="font-display text-lg font-bold hover:text-brand">{a.job.title}</Link>
                ) : (
                  <span className="font-display text-lg font-bold">Job removed</span>
                )}
                <p className="text-sm text-muted">
                  {a.job?.companyName} · Applied {new Date(a.createdAt).toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={a.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
