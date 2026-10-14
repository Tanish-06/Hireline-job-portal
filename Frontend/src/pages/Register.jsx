import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/axios";
import Alert from "../components/Alert";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "jobseeker" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await register(form);
      navigate(user.role === "recruiter" ? "/recruiter/dashboard" : "/profile", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-3xl font-bold">Create your account</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <fieldset>
          <legend className="label">I want to</legend>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["jobseeker", "Find a job"],
              ["recruiter", "Hire people"],
            ].map(([value, text]) => (
              <label key={value} className={`cursor-pointer rounded-md border px-3 py-2 text-center text-sm font-medium ${form.role === value ? "border-brand bg-brand-soft text-brand" : "border-line bg-white"}`}>
                <input type="radio" name="role" value={value} checked={form.role === value} onChange={handleChange} className="sr-only" />
                {text}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" name="name" className="input" required value={form.name} onChange={handleChange} />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="input" required value={form.email} onChange={handleChange} />
        </div>
        <div>
          <label className="label" htmlFor="password">Password (min 6 characters)</label>
          <input id="password" name="password" type="password" minLength={6} className="input" required value={form.password} onChange={handleChange} />
        </div>
        <Alert>{error}</Alert>
        <button className="btn w-full" disabled={loading}>{loading ? "Creating account…" : "Create account"}</button>
      </form>
      <p className="mt-4 text-sm text-muted">
        Already have an account? <Link to="/login" className="font-semibold text-brand">Log in</Link>
      </p>
    </div>
  );
}
