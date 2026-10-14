import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { getErrorMessage, fileUrl } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`)
      .then((res) => setJob(res.data.job))
      .catch((err) => setError(getErrorMessage(err)));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    // files must be sent as FormData, not JSON
    const formData = new FormData();
    formData.append("coverLetter", coverLetter);
    if (resume) formData.append("resume", resume);

    try {
      await api.post(`/applications/${id}`, formData);
      setMessage({ type: "success", text: "Application sent. Track it under My applications." });
      setCoverLetter("");
      setResume(null);
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  if (error) return <Alert>{error}</Alert>;
  if (!job) return <p className="py-10 text-center text-muted">Loading…</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <article className="lg:col-span-2">
        <Link to="/" className="text-sm text-muted hover:text-brand">Back to jobs</Link>
        <h1 className="mt-3 text-3xl font-bold">{job.title}</h1>
        <p className="mt-1 text-muted">{job.companyName} · {job.location}</p>

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-brand-soft px-3 py-1 font-semibold text-brand">{job.jobType}</span>
          {job.salary > 0 && <span className="rounded-full bg-white px-3 py-1 font-semibold border border-line">{job.salary} LPA</span>}
        </div>

        <h2 className="mt-8 text-xl font-bold">About the role</h2>
        <p className="mt-2 max-w-prose whitespace-pre-line leading-relaxed">{job.description}</p>

        {job.skills?.length > 0 && (
          <>
            <h2 className="mt-8 text-xl font-bold">Skills</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <span key={s} className="rounded border border-line bg-white px-2 py-1 text-sm">{s}</span>
              ))}
            </div>
          </>
        )}
      </article>

      <aside className="h-fit rounded-lg border border-line bg-white p-5">
        <h2 className="text-lg font-bold">Apply for this job</h2>

        {!user && (
          <p className="mt-3 text-sm text-muted">
            <Link to="/login" className="font-semibold text-brand">Log in</Link> or{" "}
            <Link to="/register" className="font-semibold text-brand">create an account</Link> to apply.
          </p>
        )}

        {user?.role === "recruiter" && (
          <p className="mt-3 text-sm text-muted">Recruiter accounts can't apply to jobs.</p>
        )}

        {user?.role === "jobseeker" && (
          <form onSubmit={handleApply} className="mt-4 space-y-4">
            <div>
              <label className="label" htmlFor="coverLetter">Cover letter (optional)</label>
              <textarea id="coverLetter" className="input" rows={4} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="resume">Resume (PDF, max 2 MB)</label>
              <input id="resume" type="file" accept="application/pdf" className="text-sm" onChange={(e) => setResume(e.target.files[0])} />
              {user.profile?.resumeUrl ? (
                <p className="mt-1 text-xs text-muted">
                  No file chosen? We'll use your{" "}
                  <a className="text-brand underline" href={fileUrl(user.profile.resumeUrl)} target="_blank" rel="noreferrer">saved resume</a>.
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted">You haven't saved a resume on your profile yet.</p>
              )}
            </div>
            <Alert type={message.type}>{message.text}</Alert>
            <button className="btn w-full" disabled={submitting}>{submitting ? "Sending…" : "Send application"}</button>
          </form>
        )}
      </aside>
    </div>
  );
}
