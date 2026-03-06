import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./JobTracker.css";

export default function JobTracker() {

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingJob, setEditingJob] = useState(null);
  const [editForm, setEditForm] = useState({});


  const [form, setForm] = useState({
    company: "",
    role: "",
    status: "not applied",
    job_link: "",
    date_applied: "",
    deadline: "",
    notes: "",
  });

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // FETCH JOBS
  const fetchJobs = useCallback(async (page = 1, status = "", ordering = "") => {

    if (!token) return;

    setLoading(true);

    try {

      const res = await axios.get(
        `http://127.0.0.1:8000/application-tracker/job-application/?page=${page}&status=${status}&ordering=${ordering}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const jobsArray = Array.isArray(res.data)
        ? res.data
        : res.data.results || [];

      setJobs(jobsArray);

    } catch (err) {

      console.error("Fetch error:", err);
      setJobs([]);

    }

    setLoading(false);

  }, [token]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ADD JOB
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

      fetchJobs();

    } catch (err) {

      console.error("POST error:", err.response?.data || err.message);
      alert("Failed to add application");

    }
  };

  // START EDIT
  const startEditing = (job) => {

    setEditingJob(job.id);

    setEditForm({
      company: job.company || "",
      role: job.role || "",
      status: job.status || "",
      job_link: job.job_link || "",
      date_applied: job.date_applied || "",
      deadline: job.deadline || "",
      notes: job.notes || "",
    });

  };

  // EDIT CHANGE
  const handleEditChange = (e) => {

    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });

  };

  // UPDATE JOB
  const updateJob = async (e) => {

    e.preventDefault();

    const payload = { ...editForm };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === "") delete payload[key];
    });

    try {

      await axios.patch(
        `http://127.0.0.1:8000/application-tracker/job-application/${editingJob}/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setEditingJob(null);
      fetchJobs();

    } catch (err) {

      console.log("PATCH ERROR:", err.response?.data);

    }
  };

  return (
    <div className="job-page">

      {/* ADD FORM */}

      <div className="section">

        <h3>🚀 Track New Application</h3>

        <form onSubmit={handleSubmit} className="form-grid">

          <input
            name="company"
            placeholder="Company"
            value={form.company}
            onChange={handleChange}
            required
          />

          <input
            name="role"
            placeholder="Role"
            value={form.role}
            onChange={handleChange}
            required
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="not applied">Not Applied</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>

          <input
            name="job_link"
            placeholder="Job Link"
            value={form.job_link}
            onChange={handleChange}
          />

          <div>
            <label>Date Applied</label>
            <input
              type="date"
              name="date_applied"
              value={form.date_applied}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Deadline</label>
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
            />
          </div>

          <textarea
            name="notes"
            placeholder="Notes"
            value={form.notes}
            onChange={handleChange}
          />

          <button type="submit">Add Application</button>

        </form>

      </div>

      {/* JOB LIST */}

      <div className="section">

        <h3>My Career Pipeline</h3>

        {loading && <p>Loading...</p>}

        {!loading && jobs.length === 0 && <p>No applications yet</p>}

        {jobs.map((job) => (

          <div className="job-card" key={job.id}>

            {editingJob === job.id ? (

              <form onSubmit={updateJob} className="form-grid">

                <input
                  name="company"
                  value={editForm.company || ""}
                  onChange={handleEditChange}
                />

                <input
                  name="role"
                  value={editForm.role || ""}
                  onChange={handleEditChange}
                />

                <select
                  name="status"
                  value={editForm.status || ""}
                  onChange={handleEditChange}
                >
                  <option value="not applied">Not Applied</option>
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>

                <input
                  name="job_link"
                  placeholder="Job Link"
                  value={editForm.job_link || ""}
                  onChange={handleEditChange}
                />

                <div>
                  <label>Date Applied</label>
                  <input
                    type="date"
                    name="date_applied"
                    value={editForm.date_applied || ""}
                    onChange={handleEditChange}
                  />
                </div>

                <div>
                  <label>Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={editForm.deadline || ""}
                    onChange={handleEditChange}
                  />
                </div>

                <textarea
                  name="notes"
                  placeholder="Notes"
                  value={editForm.notes || ""}
                  onChange={handleEditChange}
                />

                <button type="submit">Save</button>

                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                >
                  Cancel
                </button>

              </form>

            ) : (

              <>

                <button
                  className="edit-btn"
                  onClick={() => startEditing(job)}
                >
                  ✏️
                </button>

                <span className={`status-badge status-${job.status.replace(" ", "_")}`}>
                  {job.status}
                </span>

                <h4>{job.company}</h4>

                <p className="role">{job.role}</p>

                <div className="meta-info">

                  <span>📅 Applied: {job.date_applied || "N/A"}</span>

                  <span>⏰ Deadline: {job.deadline || "N/A"}</span>

                  {job.job_link && (
                    <span>
                      🔗
                      <a href={job.job_link} target="_blank" rel="noreferrer">
                        Job Post
                      </a>
                    </span>
                  )}

                </div>

                {job.notes && (
                  <div className="notes-box">{job.notes}</div>
                )}

              </>

            )}

          </div>

        ))}

      </div>

    </div>
  );
}