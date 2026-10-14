import { useState } from "react";
import api, { getErrorMessage, fileUrl } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";

export default function Profile() {
  const { user, setUser } = useAuth();
  const p = user.profile || {};
  const [form, setForm] = useState({
    name: user.name,
    bio: p.bio || "",
    location: p.location || "",
    skills: (p.skills || []).join(", "),
    companyName: p.companyName || "",
    companyWebsite: p.companyWebsite || "",
  });
  const [resume, setResume] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (resume) formData.append("resume", resume);

    try {
      const res = await api.put("/users/profile", formData);
      setUser(res.data.user); // keep the navbar & context in sync
      setResume(null);
      setMessage({ type: "success", text: "Profile saved." });
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const isRecruiter = user.role === "recruiter";

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-bold">Your profile</h1>
      <p className="mt-1 text-sm text-muted">{user.email} · {isRecruiter ? "Recruiter" : "Job seeker"}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" name="name" className="input" value={form.name} onChange={handleChange} />
        </div>
        <div>
          <label className="label" htmlFor="location">Location</label>
          <input id="location" name="location" className="input" value={form.location} onChange={handleChange} />
        </div>

        {isRecruiter ? (
          <>
            <div>
              <label className="label" htmlFor="companyName">Company name</label>
              <input id="companyName" name="companyName" className="input" value={form.companyName} onChange={handleChange} />
            </div>
            <div>
              <label className="label" htmlFor="companyWebsite">Company website</label>
              <input id="companyWebsite" name="companyWebsite" className="input" value={form.companyWebsite} onChange={handleChange} />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="label" htmlFor="bio">About you</label>
              <textarea id="bio" name="bio" rows={4} className="input" value={form.bio} onChange={handleChange} />
            </div>
            <div>
              <label className="label" htmlFor="skills">Skills (comma separated)</label>
              <input id="skills" name="skills" className="input" placeholder="React, Node.js, MongoDB" value={form.skills} onChange={handleChange} />
            </div>
            <div>
              <label className="label" htmlFor="resume">Resume (PDF, max 2 MB)</label>
              <input id="resume" type="file" accept="application/pdf" className="text-sm" onChange={(e) => setResume(e.target.files[0])} />
              {p.resumeUrl && (
                <p className="mt-1 text-sm">
                  Saved resume:{" "}
                  <a className="text-brand underline" href={fileUrl(p.resumeUrl)} target="_blank" rel="noreferrer">View PDF</a>
                </p>
              )}
            </div>
          </>
        )}

        <Alert type={message.type}>{message.text}</Alert>
        <button className="btn" disabled={saving}>{saving ? "Saving…" : "Save profile"}</button>
      </form>
    </div>
  );
}
