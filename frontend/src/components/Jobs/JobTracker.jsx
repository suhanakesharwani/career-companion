import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // For redirect if not logged in
import axios from "axios";
import "./JobTracker.css";

export default function JobTracker() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    company: "",
    role: "",
    status: "not applied",
    job_link: "",
    date_applied: "",
    deadline: "",
    notes: "",
  });

  // ---------------- FETCH JOBS ----------------
  const fetchJobs = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/application-tracker/job-application/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      // Ensure array
      const jobsArray = Array.isArray(data) ? data : data.results || [];
      setJobs(jobsArray);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setJobs([]);
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ---------------- HANDLE FORM ----------------
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { ...form };
    if (!payload.date_applied) delete payload.date_applied;
    if (!payload.deadline) delete payload.deadline;

    try {
      await axios.post(
        "http://127.0.0.1:8000/application-tracker/job-application/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setForm({
        company: "",
        role: "",
        status: "not applied",
        job_link: "",
        date_applied: "",
        deadline: "",
        notes: "",
      });

      fetchJobs(); // Refresh list
    } catch (err) {
      console.error("POST error:", err.response?.data || err.message);
      alert("Failed to add application");
    }
  };

  return (
    <div className="job-page">
      {/* ---------------- ADD FORM ---------------- */}
      <div className="section">
        <h3>🚀 Track New Application</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <input
              name="company"
              placeholder="Company"
              value={form.company}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              name="role"
              placeholder="Role"
              value={form.role}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="not applied">Not Applied</option>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="form-group">
            <input
              name="job_link"
              placeholder="Job Link"
              value={form.job_link}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Date Applied</label>
            <input
              type="date"
              name="date_applied"
              value={form.date_applied}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full-width">
            <label>Deadline</label>
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <textarea
              name="notes"
              placeholder="Notes"
              value={form.notes}
              onChange={handleChange}
            />
          </div>

          <button type="submit">Add Application</button>
        </form>
      </div>

      {/* ---------------- LIST ---------------- */}
      <div className="section">
        <h3>My Career Pipeline</h3>

        {loading && <p>Loading your applications...</p>}

        {!loading && jobs.length === 0 && (
          <p>No applications found. Start by adding one above!</p>
        )}

        {jobs.map((job) => (
          <div className="job-card" key={job.id}>
            <span
              className={`status-badge status-${job.status.replace(" ", "_")}`}
            >
              {job.status}
            </span>

            <h4>{job.company}</h4>
            <p className="role">{job.role}</p>

            <div className="meta-info">
              <span>📅 Applied: {job.date_applied || "N/A"}</span>
              <span>⏰ Deadline: {job.deadline || "N/A"}</span>
              {job.job_link && (
                <span>
                  🔗{" "}
                  <a href={job.job_link} target="_blank" rel="noreferrer">
                    Job Post
                  </a>
                </span>
              )}
            </div>

            {job.notes && <div className="notes-box">{job.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}