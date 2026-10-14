import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/axios";
import Alert from "../components/Alert";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await login(form.email, form.password);
      const fallback = user.role === "recruiter" ? "/recruiter/dashboard" : "/";
      navigate(location.state?.from?.pathname || fallback, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-3xl font-bold">Welcome back</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" className="input" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <Alert>{error}</Alert>
        <button className="btn w-full" disabled={loading}>{loading ? "Logging in…" : "Log in"}</button>
      </form>
      <p className="mt-4 text-sm text-muted">
        New here? <Link to="/register" className="font-semibold text-brand">Create an account</Link>
      </p>
    </div>
  );
}
