import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import React from "react";
axios.defaults.withCredentials = true;

const API = "https://career-companion-backend-uhlf.onrender.com";

const STATUS_CONFIG = {
  "not applied": { label: "Not Applied", color: "#444",    bg: "#1A1A24", dot: "#555" },
  "applied":     { label: "Applied",     color: "#A1C4FD", bg: "#0D1525", dot: "#A1C4FD" },
  "interview":   { label: "Interview",   color: "#FDDB92", bg: "#1A1500", dot: "#FDDB92" },
  "offer":       { label: "Offer",       color: "#C8FF57", bg: "#111A0D", dot: "#C8FF57" },
  "rejected":    { label: "Rejected",    color: "#FF6B6B", bg: "#1A0D0D", dot: "#FF6B6B" },
};

const EMPTY_FORM = {
  company: "", role: "", status: "not applied",
  job_link: "", date_applied: "", deadline: "", notes: "",
};

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0A0A0F;
    --surface: #111118;
    --surface2: #0F0F16;
    --border: #1E1E2C;
    --accent: #C8FF57;
    --text: #F0EEE8;
    --muted: #555;
    --faint: #1A1A24;
  }

  .jt-root {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    position: relative;
  }

  .jt-root::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none; z-index: 0;
  }

  .jt-container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 24px 80px;
    position: relative; z-index: 1;
  }

  /* TOPBAR */
  .jt-topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 28px 0;
    border-bottom: 1px solid var(--border);
    margin-bottom: 48px;
  }
  .jt-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1rem; letter-spacing: -0.02em; }
  .jt-logo span { color: var(--accent); }
  .jt-back {
    display: inline-flex; align-items: center; gap: 8px;
    background: none; border: 1px solid var(--border); color: var(--muted);
    font-family: 'DM Sans', sans-serif; font-size: 0.82rem;
    padding: 7px 16px; border-radius: 100px; cursor: pointer; transition: all 0.2s;
  }
  .jt-back:hover { border-color: #888; color: var(--text); }

  /* HERO */
  .jt-hero {
    margin-bottom: 48px;
    display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap;
  }
  .jt-hero-eyebrow {
    font-size: 0.68rem; font-weight: 600; letter-spacing: 0.18em;
    text-transform: uppercase; color: var(--accent);
    margin-bottom: 14px; display: flex; align-items: center; gap: 10px;
  }
  .jt-hero-eyebrow::before { content:''; display:inline-block; width:20px; height:1px; background:var(--accent); }
  .jt-hero h1 {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: clamp(2.4rem, 5vw, 3.8rem);
    letter-spacing: -0.04em; line-height: 0.95;
  }
  .jt-hero h1 span { color: var(--accent); }
  .jt-hero-sub { margin-top: 12px; font-size: 0.9rem; color: #666; font-weight: 300; }

  .jt-stats { display: flex; gap: 24px; align-items: center; flex-shrink: 0; }
  .jt-stat { text-align: right; }
  .jt-stat .val { font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800; line-height: 1; }
  .jt-stat .lbl { font-size: 0.65rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; }
  .jt-stat-div { width: 1px; height: 36px; background: var(--border); }

  /* LAYOUT */
  .jt-layout { display: grid; grid-template-columns: 340px 1fr; gap: 24px; align-items: start; }

  /* FORM PANEL */
  .jt-panel {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 20px; padding: 28px;
    position: sticky; top: 24px;
  }
  .jt-panel-title {
    font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700;
    margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;
  }
  .jt-panel-title .badge {
    font-size: 0.65rem; color: var(--muted);
    background: var(--faint); padding: 3px 10px; border-radius: 100px;
  }

  .jt-field { margin-bottom: 14px; }
  .jt-field label {
    display: block; font-size: 0.7rem; font-weight: 600;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--muted); margin-bottom: 6px;
  }
  .jt-field input,
  .jt-field select,
  .jt-field textarea {
    width: 100%; background: var(--bg); border: 1px solid var(--border);
    color: var(--text); padding: 10px 12px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 0.88rem;
    transition: border-color 0.2s; outline: none; appearance: none;
  }
  .jt-field input:focus, .jt-field select:focus, .jt-field textarea:focus { border-color: var(--accent); }
  .jt-field textarea { resize: vertical; min-height: 80px; }
  .jt-field select option { background: #111; }
  .jt-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .jt-field-row > .jt-field { min-width: 0; }

  .jt-submit {
    width: 100%; margin-top: 8px;
    background: var(--accent); color: #0A0A0F;
    border: none; border-radius: 100px; padding: 11px;
    font-size: 0.88rem; font-weight: 700; font-family: 'Syne', sans-serif;
    cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; letter-spacing: 0.02em;
  }
  .jt-submit:hover { transform: scale(1.02); box-shadow: 0 0 20px rgba(200,255,87,0.25); }

  /* RIGHT COLUMN */
  .jt-right { display: flex; flex-direction: column; gap: 16px; }

  /* SEARCH + FILTER */
  .jt-controls {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 16px 20px;
    display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
  }
  .jt-search-wrap { flex: 1; min-width: 180px; position: relative; display: flex; align-items: center; }
  .jt-search-icon { position: absolute; left: 12px; font-size: 0.85rem; color: var(--muted); pointer-events: none; }
  .jt-search {
    width: 100%; background: var(--bg); border: 1px solid var(--border);
    color: var(--text); padding: 8px 12px 8px 34px;
    border-radius: 100px; font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem; outline: none; transition: border-color 0.2s;
  }
  .jt-search:focus { border-color: var(--accent); }
  .jt-search::placeholder { color: #333; }

  .jt-filter-chips { display: flex; gap: 6px; flex-wrap: wrap; }
  .jt-chip {
    padding: 6px 14px; border-radius: 100px; font-size: 0.75rem; font-weight: 600;
    cursor: pointer; transition: all 0.18s; border: 1px solid transparent;
    font-family: 'DM Sans', sans-serif; white-space: nowrap;
  }
  .jt-chip.all { background: var(--faint); color: var(--muted); border-color: var(--border); }
  .jt-chip.all.active { background: var(--accent); color: #0A0A0F; border-color: var(--accent); }
  .jt-results-count { font-size: 0.75rem; color: var(--muted); white-space: nowrap; margin-left: auto; }

  /* JOB CARDS */
  .jt-card {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 16px; padding: 22px 24px;
    transition: border-color 0.2s, transform 0.2s;
    animation: fadeUp 0.35s ease both;
  }
  .jt-card:hover { border-color: #2E2E40; transform: translateY(-2px); }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

  .jt-card-header {
    display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 10px;
  }
  .jt-card-left { flex: 1; min-width: 0; }
  .jt-card-company {
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.05rem;
    margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .jt-card-role { font-size: 0.85rem; color: #888; }

  .jt-status-badge {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.7rem; font-weight: 600;
    padding: 4px 12px; border-radius: 100px; white-space: nowrap; flex-shrink: 0;
  }
  .jt-status-dot { width: 5px; height: 5px; border-radius: 50%; }

  .jt-card-meta { display: flex; gap: 16px; font-size: 0.78rem; color: #555; margin-top: 10px; flex-wrap: wrap; }
  .jt-card-meta span { display: flex; align-items: center; gap: 5px; }
  .jt-meta-label { color: #383848; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; }

  .jt-card-link {
    font-size: 0.78rem; color: var(--accent); text-decoration: none;
    display: inline-flex; align-items: center; gap: 4px; opacity: 0.7; transition: opacity 0.2s;
  }
  .jt-card-link:hover { opacity: 1; }

  .jt-card-notes {
    margin-top: 12px; padding: 10px 14px;
    background: var(--faint); border-radius: 8px;
    font-size: 0.82rem; color: #777; line-height: 1.5;
    border-left: 2px solid var(--border);
  }

  .jt-card-actions {
    display: flex; gap: 8px; margin-top: 14px; padding-top: 14px; border-top: 1px solid #15151F;
  }
  .jt-edit-btn {
    display: inline-flex; align-items: center; gap: 6px;
    background: none; border: 1px solid var(--border); color: var(--muted);
    border-radius: 100px; padding: 6px 14px; font-size: 0.78rem;
    cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  }
  .jt-edit-btn:hover { border-color: var(--accent); color: var(--accent); }

  /* INLINE EDIT FORM */
  .jt-edit-form {
    margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border);
    display: flex; flex-direction: column; gap: 12px;
  }
  .jt-edit-form .jt-field { margin-bottom: 0; }
  .jt-edit-actions { display: flex; gap: 8px; }
  .jt-save-btn {
    flex: 1; background: var(--accent); color: #0A0A0F;
    border: none; border-radius: 100px; padding: 9px;
    font-size: 0.82rem; font-weight: 700; font-family: 'Syne', sans-serif;
    cursor: pointer; transition: all 0.15s;
  }
  .jt-save-btn:hover { box-shadow: 0 0 16px rgba(200,255,87,0.2); }
  .jt-cancel-sm {
    background: none; color: var(--muted); border: 1px solid var(--border);
    border-radius: 100px; padding: 9px 18px; font-size: 0.82rem;
    font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; white-space: nowrap;
  }
  .jt-cancel-sm:hover { border-color: #555; color: var(--text); }

  /* EMPTY */
  .jt-empty { text-align: center; padding: 60px 20px; color: #333; }
  .jt-empty .big { font-size: 3rem; display: block; margin-bottom: 12px; }
  .jt-empty p { font-size: 0.9rem; }

  /* RESPONSIVE */
  @media (max-width: 900px) {
    .jt-layout { grid-template-columns: 1fr; }
    .jt-panel { position: static; }
    .jt-stats { display: none; }
  }
  @media (max-width: 600px) {
    .jt-container { padding: 0 16px 60px; }
    .jt-field-row { grid-template-columns: 1fr; }
  }
    
`;



const FormFields = React.memo(function FormFields({ values, onChange, isEdit = false }) {
  return (
    <>
      <div className="jt-field-row">
        <div className="jt-field">
          <label>Company {!isEdit && "*"}</label>
          <input name="company" placeholder="e.g. Google" value={values.company || ""} onChange={onChange} required={!isEdit} />
        </div>
        <div className="jt-field">
          <label>Role {!isEdit && "*"}</label>
          <input name="role" placeholder="e.g. SWE Intern" value={values.role || ""} onChange={onChange} required={!isEdit} />
        </div>
      </div>
      <div className="jt-field">
        <label>Status</label>
        <select name="status" value={values.status || "not applied"} onChange={onChange}>
          {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
            <option key={val} value={val}>{cfg.label}</option>
          ))}
        </select>
      </div>
      <div className="jt-field">
        <label>Job Link</label>
        <input name="job_link" placeholder="https://..." value={values.job_link || ""} onChange={onChange} />
      </div>
      <div className="jt-field-row">
        <div className="jt-field">
          <label>Date Applied</label>
          <input type="date" name="date_applied" value={values.date_applied || ""} onChange={onChange} />
        </div>
        <div className="jt-field">
          <label>Deadline</label>
          <input type="date" name="deadline" value={values.deadline || ""} onChange={onChange} />
        </div>
      </div>
      <div className="jt-field">
        <label>Notes</label>
        <textarea name="notes" placeholder="Any notes, contacts, links…" value={values.notes || ""} onChange={onChange} />
      </div>
    </>
  );
});

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["not applied"];
  return (
    <span className="jt-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
      <span className="jt-status-dot" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

function formatDate(d) {
  if (!d) return null;
  try { return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return d; }
}

export default function JobTracker() {
  
  const navigate = useNavigate();
  

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [form, setForm] = useState({ ...EMPTY_FORM });

  
  const fetchJobs = useCallback(async () => {
   
    setLoading(true);
    try {
      const res = await axios.get(`${API}/application-tracker/job-application/`, );
      setJobs(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch { setJobs([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.date_applied) delete payload.date_applied;
    if (!payload.deadline) delete payload.deadline;
    await axios.post(`${API}/application-tracker/job-application/`, payload);
    setForm({ ...EMPTY_FORM });
    fetchJobs();
  };

  const startEditing = (job) => {
    setEditingJob(job.id);
    setEditForm({ ...EMPTY_FORM, ...job });
  };

  const updateJob = async (e) => {
    e.preventDefault();
    const payload = { ...editForm };
    if (!payload.date_applied) delete payload.date_applied;
    if (!payload.deadline) delete payload.deadline;
    await axios.patch(`${API}/application-tracker/job-application/${editingJob}/`, payload);
    setEditingJob(null);
    fetchJobs();
  };

  const filtered = useMemo(() => jobs.filter(job => {
    const matchesStatus = filterStatus === "all" || job.status === filterStatus;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      job.company?.toLowerCase().includes(q) ||
      job.role?.toLowerCase().includes(q) ||
      job.notes?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  }), [jobs, filterStatus, search]);

  const statCounts = useMemo(() => {
    const c = {};
    jobs.forEach(j => { c[j.status] = (c[j.status] || 0) + 1; });
    return c;
  }, [jobs]);

  return (
    <>
      <style>{style}</style>
      <div className="jt-root">
        <div className="jt-container">

          {/* TOPBAR */}
          <div className="jt-topbar">
            <div className="jt-logo">Career <span>Companion</span></div>
            <button className="jt-back" onClick={() => navigate("/")}>← Home</button>
          </div>

          {/* HERO */}
          <div className="jt-hero">
            <div>
              <div className="jt-hero-eyebrow">Application Tracker</div>
              <h1>Job <span>Tracker</span></h1>
              <p className="jt-hero-sub">Track every application, deadline, and follow-up in one place.</p>
            </div>
            <div className="jt-stats">
              <div className="jt-stat">
                <div className="val" style={{ color: "var(--accent)" }}>{jobs.length}</div>
                <div className="lbl">Total</div>
              </div>
              <div className="jt-stat-div" />
              <div className="jt-stat">
                <div className="val" style={{ color: STATUS_CONFIG.interview.color }}>{statCounts.interview || 0}</div>
                <div className="lbl">Interviews</div>
              </div>
              <div className="jt-stat-div" />
              <div className="jt-stat">
                <div className="val" style={{ color: STATUS_CONFIG.offer.color }}>{statCounts.offer || 0}</div>
                <div className="lbl">Offers</div>
              </div>
            </div>
          </div>

          {/* LAYOUT */}
          <div className="jt-layout">

            {/* LEFT: ADD FORM */}
            <div className="jt-panel">
              <div className="jt-panel-title">
                Add Application
                <span className="badge">New</span>
              </div>
              <form onSubmit={handleSubmit}>
                <FormFields values={form} onChange={handleChange} />
                <button type="submit" className="jt-submit">Add Application →</button>
              </form>
            </div>

            {/* RIGHT: SEARCH + CARDS */}
            <div className="jt-right">

              {/* CONTROLS */}
              <div className="jt-controls">
                <div className="jt-search-wrap">
                  <span className="jt-search-icon">🔍</span>
                  <input
                    className="jt-search"
                    placeholder="Search company, role, notes…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div className="jt-filter-chips">
                  <button
                    className={`jt-chip all${filterStatus === "all" ? " active" : ""}`}
                    onClick={() => setFilterStatus("all")}
                  >All</button>
                  {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                    <button
                      key={val}
                      className="jt-chip"
                      style={filterStatus === val
                        ? { background: cfg.bg, color: cfg.color, borderColor: cfg.color }
                        : { background: "var(--faint)", color: "var(--muted)", borderColor: "var(--border)" }
                      }
                      onClick={() => setFilterStatus(filterStatus === val ? "all" : val)}
                    >
                      {cfg.label}{statCounts[val] ? ` (${statCounts[val]})` : ""}
                    </button>
                  ))}
                </div>
                <span className="jt-results-count">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
              </div>

              {/* CARDS */}
              {loading ? (
                <div className="jt-empty"><span className="big">⏳</span><p>Loading applications…</p></div>
              ) : filtered.length === 0 ? (
                <div className="jt-empty">
                  <span className="big">{search || filterStatus !== "all" ? "🔎" : "📋"}</span>
                  <p>{search || filterStatus !== "all"
                    ? "No matches found. Try adjusting your search or filter."
                    : "No applications yet. Add your first one!"}</p>
                </div>
              ) : filtered.map((job, idx) => (
                <div key={job.id} className="jt-card" style={{ animationDelay: `${idx * 0.04}s` }}>
                  <div className="jt-card-header">
                    <div className="jt-card-left">
                      <div className="jt-card-company">{job.company}</div>
                      <div className="jt-card-role">{job.role}</div>
                    </div>
                    <StatusBadge status={job.status} />
                  </div>

                  <div className="jt-card-meta">
                    {job.date_applied && (
                      <span>
                        <span className="jt-meta-label">Applied</span>
                        {formatDate(job.date_applied)}
                      </span>
                    )}
                    {job.deadline && (
                      <span>
                        <span className="jt-meta-label">Deadline</span>
                        {formatDate(job.deadline)}
                      </span>
                    )}
                    {job.job_link && (
                      <a href={job.job_link} target="_blank" rel="noreferrer" className="jt-card-link"
                        onClick={e => e.stopPropagation()}>
                        🔗 View Posting
                      </a>
                    )}
                  </div>

                  {job.notes && <div className="jt-card-notes">{job.notes}</div>}

                  <div className="jt-card-actions">
                    <button
                      className="jt-edit-btn"
                      onClick={() => editingJob === job.id ? setEditingJob(null) : startEditing(job)}
                    >
                      {editingJob === job.id ? "✕ Cancel" : "✏️ Edit"}
                    </button>
                  </div>

                  {editingJob === job.id && (
                    <form className="jt-edit-form" onSubmit={updateJob}>
                      <FormFields values={editForm} onChange={handleEditChange} isEdit />
                      <div className="jt-edit-actions">
                        <button type="submit" className="jt-save-btn">Save Changes</button>
                        <button type="button" className="jt-cancel-sm" onClick={() => setEditingJob(null)}>Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}