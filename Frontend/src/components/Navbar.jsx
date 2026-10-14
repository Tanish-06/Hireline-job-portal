import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  `text-sm font-medium ${isActive ? "text-brand" : "text-muted hover:text-ink"}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="border-b border-line bg-white">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="font-display text-xl font-bold text-brand">
          Hireline
        </Link>

        <div className="flex flex-wrap items-center gap-5">
          <NavLink to="/" end className={linkClass}>Jobs</NavLink>

          {user?.role === "jobseeker" && (
            <NavLink to="/my-applications" className={linkClass}>My applications</NavLink>
          )}
          {user?.role === "recruiter" && (
            <>
              <NavLink to="/recruiter/dashboard" className={linkClass}>Dashboard</NavLink>
              <NavLink to="/recruiter/jobs/new" className={linkClass}>Post a job</NavLink>
            </>
          )}

          {user ? (
            <>
              <NavLink to="/profile" className={linkClass}>{user.name.split(" ")[0]}</NavLink>
              <button onClick={handleLogout} className="btn-outline !px-3 !py-1.5">Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>Log in</NavLink>
              <Link to="/register" className="btn !px-3 !py-1.5">Sign up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
