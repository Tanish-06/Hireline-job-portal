import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/axios";
import JobCard from "../components/JobCard";
import Alert from "../components/Alert";

const emptyFilters = { search: "", location: "", jobType: "", minSalary: "" };

export default function Home() {
  const [form, setForm] = useState(emptyFilters);       // what the user is typing
  const [filters, setFilters] = useState(emptyFilters); // what was actually applied
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ jobs: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // refetch whenever the applied filters or page change
  useEffect(() => {
    setLoading(true);
    setError("");
    const params = { ...filters, page };
    Object.keys(params).forEach((k) => params[k] === "" && delete params[k]);

    api
      .get("/jobs", { params })
      .then((res) => setData(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [filters, page]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const applyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    setFilters(form);
  };

  const clearFilters = () => {
    setForm(emptyFilters);
    setFilters(emptyFilters);
    setPage(1);
  };

  return (
    <div>
      <h1 className="text-4xl font-bold">Find a job you actually want</h1>
      <p className="mt-2 text-muted">Search by role, company or skill, then narrow it down.</p>

      <form onSubmit={applyFilters} className="mt-6 grid gap-3 rounded-lg border border-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
        <input className="input lg:col-span-2" name="search" value={form.search} onChange={handleChange} placeholder="Role, company or skill" />
        <input className="input" name="location" value={form.location} onChange={handleChange} placeholder="Location" />
        <select className="input" name="jobType" value={form.jobType} onChange={handleChange}>
          <option value="">Any job type</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="internship">Internship</option>
          <option value="contract">Contract</option>
          <option value="remote">Remote</option>
        </select>
        <input className="input" type="number" min="0" step="0.5" name="minSalary" value={form.minSalary} onChange={handleChange} placeholder="Min salary (LPA)" />
        <div className="flex gap-2 sm:col-span-2 lg:col-span-5">
          <button className="btn" type="submit">Search jobs</button>
          <button className="btn-outline" type="button" onClick={clearFilters}>Clear filters</button>
        </div>
      </form>

      <div className="mt-6">
        <Alert>{error}</Alert>
        {loading ? (
          <p className="py-10 text-center text-muted">Loading jobs…</p>
        ) : data.jobs.length === 0 ? (
          <p className="py-10 text-center text-muted">No jobs match these filters. Try clearing some.</p>
        ) : (
          <>
            <p className="mb-3 text-sm text-muted">{data.total} job{data.total !== 1 && "s"} found</p>
            <div className="grid gap-4 md:grid-cols-2">
              {data.jobs.map((job) => <JobCard key={job._id} job={job} />)}
            </div>

            <div className="mt-6 flex items-center justify-center gap-4">
              <button className="btn-outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span className="text-sm text-muted">Page {data.page} of {data.pages}</span>
              <button className="btn-outline" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
