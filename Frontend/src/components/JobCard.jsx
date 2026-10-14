import { Link } from "react-router-dom";

export default function JobCard({ job }) {
  return (
    <Link
      to={`/jobs/${job._id}`}
      className="block rounded-lg border border-line bg-white p-5 transition-colors hover:border-brand"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">{job.title}</h3>
          <p className="text-sm text-muted">{job.companyName} · {job.location}</p>
        </div>
        <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
          {job.jobType}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {job.skills?.slice(0, 4).map((s) => (
          <span key={s} className="rounded bg-canvas px-2 py-0.5 text-xs text-muted">{s}</span>
        ))}
        {job.salary > 0 && (
          <span className="ml-auto text-sm font-semibold">{job.salary} LPA</span>
        )}
      </div>
    </Link>
  );
}
