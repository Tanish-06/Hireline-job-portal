import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";

// One form for both "Post a job" (/recruiter/jobs/new) and "Edit job" (/recruiter/jobs/:id/edit)
export default function JobForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    companyName: user.profile?.companyName || "",
    location: "",
    jobType: "full-time",
    salary: "",
    skills: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/jobs/${id}`)
      .then(({ data }) => {
        const j = data.job;
        setForm({
          title: j.title,
          description: j.description,
          companyName: j.companyName,
          location: j.location,
          jobType: j.jobType,
          salary: j.salary || "",
          skills: (j.skills || []).join(", "),
        });
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = { ...form, salary: form.salary === "" ? 0 : Number(form.salary) };

    try {
      if (isEdit) await api.put(`/jobs/${id}`, payload);
      else await api.post("/jobs", payload);
      navigate("/recruiter/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-bold">{isEdit ? "Edit job" : "Post a job"}</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="title">Job title</label>
          <input id="title" name="title" className="input" required value={form.title} onChange={handleChange} />
        </div>
        <div>
          <label className="label" htmlFor="companyName">Company</label>
          <input id="companyName" name="companyName" className="input" required value={form.companyName} onChange={handleChange} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="location">Location</label>
            <input id="location" name="location" className="input" required value={form.location} onChange={handleChange} />
          </div>
          <div>
            <label className="label" htmlFor="jobType">Job type</label>
            <select id="jobType" name="jobType" className="input" value={form.jobType} onChange={handleChange}>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="internship">Internship</option>
              <option value="contract">Contract</option>
              <option value="remote">Remote</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="salary">Salary (LPA, optional)</label>
          <input id="salary" name="salary" type="number" min="0" step="0.5" className="input" value={form.salary} onChange={handleChange} />
        </div>
        <div>
          <label className="label" htmlFor="skills">Skills (comma separated)</label>
          <input id="skills" name="skills" className="input" placeholder="React, Node.js, MongoDB" value={form.skills} onChange={handleChange} />
        </div>
        <div>
          <label className="label" htmlFor="description">Description (min 20 characters)</label>
          <textarea id="description" name="description" rows={7} className="input" required value={form.description} onChange={handleChange} />
        </div>
        <Alert>{error}</Alert>
        <button className="btn" disabled={saving}>{saving ? "Saving…" : isEdit ? "Save changes" : "Publish job"}</button>
      </form>
    </div>
  );
}
