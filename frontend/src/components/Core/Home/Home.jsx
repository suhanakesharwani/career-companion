import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:8000";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0A0A0F;
    --surface: #111118;
    --border: #1E1E2C;
    --border-hover: #C8FF57;
    --accent: #C8FF57;
    --accent-dim: rgba(200,255,87,0.08);
    --text: #F0EEE8;
    --muted: #555;
    --faint: #222230;
  }

  .home-root {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow-x: hidden;
  }

  /* ── BACKGROUND GRID ── */
  .home-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
    z-index: 0;
  }

  /* ── GRAIN OVERLAY ── */
  .home-root::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
    opacity: 0.4;
  }

  .home-container {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    position: relative;
    z-index: 1;
  }

  /* ── TOPBAR ── */
  .home-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28px 48px;
    border-bottom: 1px solid var(--border);
  }
  .home-logo {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    letter-spacing: -0.02em;
    color: var(--text);
  }
  .home-logo span { color: var(--accent); }
  .home-topbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .home-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 100px;
    padding: 6px 14px;
    font-size: 0.78rem;
    color: var(--muted);
  }
  .home-pill .dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--accent);
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.7); }
  }

  /* ── HERO ── */
  .home-hero {
    padding: 80px 48px 60px;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: end;
    gap: 40px;
    border-bottom: 1px solid var(--border);
  }
  .home-hero-eyebrow {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .home-hero-eyebrow::before {
    content: '';
    display: inline-block;
    width: 24px;
    height: 1px;
    background: var(--accent);
  }
  .home-hero h1 {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: clamp(2.8rem, 6vw, 5rem);
    letter-spacing: -0.04em;
    line-height: 0.95;
    color: var(--text);
  }
  .home-hero h1 .accent { color: var(--accent); }
  .home-hero h1 .italic {
    font-style: italic;
    color: var(--muted);
    font-weight: 400;
  }
  .home-hero-sub {
    margin-top: 24px;
    font-size: 1rem;
    color: #666;
    max-width: 480px;
    line-height: 1.6;
    font-weight: 300;
  }
  .home-msg {
    margin-top: 16px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(200,255,87,0.07);
    border: 1px solid rgba(200,255,87,0.2);
    border-radius: 100px;
    padding: 6px 14px;
    font-size: 0.82rem;
    color: var(--accent);
  }
  .home-hero-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    padding-bottom: 4px;
  }
  .home-stat {
    text-align: right;
  }
  .home-stat .val {
    font-family: 'Syne', sans-serif;
    font-size: 2.4rem;
    font-weight: 800;
    color: var(--accent);
    line-height: 1;
  }
  .home-stat .lbl {
    font-size: 0.72rem;
    color: var(--muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .home-stat-divider {
    width: 1px;
    height: 40px;
    background: var(--border);
    align-self: center;
    margin: 0 8px;
  }
  .home-hero-stats { display: flex; align-items: center; gap: 16px; }

  /* ── SECTION LABEL ── */
  .home-section-label {
    font-family: 'Syne', sans-serif;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #333;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .home-section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  /* ── TOOLS GRID ── */
  .home-tools {
    padding: 56px 48px;
  }
  .home-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: 24px;
    overflow: hidden;
  }

  .home-card {
    background: var(--surface);
    padding: 36px 32px;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.2s ease;
    position: relative;
    overflow: hidden;
    animation: fadeUp 0.5s ease both;
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .home-card:nth-child(1) { animation-delay: 0.05s; border-radius: 22px 0 0 0; }
  .home-card:nth-child(2) { animation-delay: 0.10s; border-radius: 0 22px 0 0; }
  .home-card:nth-child(3) { animation-delay: 0.15s; border-radius: 0 0 0 22px; }
  .home-card:nth-child(4) { animation-delay: 0.20s; border-radius: 0 0 22px 0; }

  .home-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--accent-dim);
    opacity: 0;
    transition: opacity 0.25s;
  }
  .home-card:hover { background: #13131C; }
  .home-card:hover::after { opacity: 1; }

  .home-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 28px;
  }
  .home-card-num {
    font-family: 'Syne', sans-serif;
    font-size: 0.68rem;
    font-weight: 700;
    color: #333;
    letter-spacing: 0.12em;
  }
  .home-card-icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: var(--faint);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    transition: border-color 0.2s, background 0.2s;
    flex-shrink: 0;
  }
  .home-card:hover .home-card-icon {
    border-color: var(--accent);
    background: rgba(200,255,87,0.08);
  }
  .home-card h3 {
    font-family: 'Syne', sans-serif;
    font-size: 1.15rem;
    font-weight: 700;
    margin-bottom: 10px;
    letter-spacing: -0.01em;
    position: relative;
    z-index: 1;
  }
  .home-card p {
    font-size: 0.85rem;
    color: #666;
    line-height: 1.6;
    font-weight: 300;
    flex: 1;
    position: relative;
    z-index: 1;
  }
  .home-card-footer {
    margin-top: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    z-index: 1;
  }
  .home-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--accent);
    color: #0A0A0F;
    border: none;
    border-radius: 100px;
    padding: 8px 18px;
    font-size: 0.8rem;
    font-weight: 700;
    font-family: 'Syne', sans-serif;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    letter-spacing: 0.02em;
  }
  .home-btn:hover {
    transform: scale(1.04);
    box-shadow: 0 0 20px rgba(200,255,87,0.3);
  }
  .home-btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: none;
    color: var(--muted);
    border: 1px solid var(--border);
    border-radius: 100px;
    padding: 8px 18px;
    font-size: 0.8rem;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.15s;
  }
  .home-btn-ghost:hover { border-color: #555; color: #888; }
  .home-card-status {
    font-size: 0.7rem;
    color: #333;
    font-style: italic;
  }

  /* ── TICKER / WHY STRIP ── */
  .home-strip {
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 0 48px;
    display: flex;
    align-items: stretch;
    gap: 0;
    overflow: hidden;
  }
  .home-strip-label {
    font-family: 'Syne', sans-serif;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--accent);
    writing-mode: vertical-lr;
    transform: rotate(180deg);
    padding: 24px 0;
    border-right: 1px solid var(--border);
    margin-right: 32px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }
  .home-strip-items {
    display: flex;
    align-items: center;
    gap: 0;
    flex: 1;
    flex-wrap: wrap;
  }
  .home-strip-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 28px 20px 0;
    border-right: 1px solid var(--border);
    font-size: 0.85rem;
    color: #555;
    flex-shrink: 0;
    transition: color 0.2s;
  }
  .home-strip-item:last-child { border-right: none; }
  .home-strip-item:hover { color: var(--text); }
  .home-strip-item .strip-num {
    font-family: 'Syne', sans-serif;
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--accent);
    opacity: 0.6;
  }

  /* ── FOOTER ── */
  .home-footer {
    padding: 32px 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--border);
  }
  .home-footer p { font-size: 0.78rem; color: #333; }
  .home-footer-accent {
    font-family: 'Syne', sans-serif;
    font-size: 0.78rem;
    color: #2A2A38;
    font-weight: 700;
    letter-spacing: 0.1em;
  }

  /* ── ANIMATIONS ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .home-hero { animation: fadeUp 0.5s ease both; }
  .home-topbar { animation: fadeUp 0.4s ease both; }

  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    .home-topbar, .home-hero, .home-tools, .home-strip, .home-footer {
      padding-left: 20px;
      padding-right: 20px;
    }
    .home-hero { grid-template-columns: 1fr; }
    .home-hero-right { display: none; }
    .home-grid { grid-template-columns: 1fr; }
    .home-card:nth-child(1) { border-radius: 22px 22px 0 0; }
    .home-card:nth-child(2) { border-radius: 0; }
    .home-card:nth-child(3) { border-radius: 0; }
    .home-card:nth-child(4) { border-radius: 0 0 22px 22px; }
    .home-strip-label { display: none; }
    .home-strip-item { padding: 16px 20px 16px 0; font-size: 0.8rem; }
  }
`;

const tools = [
  {
    num: "01",
    icon: "⚡",
    title: "Resume–JD Matcher",
    desc: "Compare your resume with job descriptions and instantly surface missing skills and keyword gaps.",
    btn: "Start Matching",
    route: "/matcher",
    status: null,
  },
  {
    num: "02",
    icon: "🔍",
    title: "Resume Analyzer",
    desc: "Get ATS feedback, structure insights, and actionable improvements to stand out to recruiters.",
    btn: "Analyze Resume",
    route: null,
    status: "In progress",
  },
  {
    num: "03",
    icon: "📌",
    title: "Job Tracker",
    desc: "Manage applications, deadlines, and follow-ups in one clean, distraction-free dashboard.",
    btn: "Track Jobs",
    route: "/jobs",
    status: null,
  },
  {
    num: "04",
    icon: "🎯",
    title: "Interview Prep",
    desc: "Structured learning paths, topic-wise progress tracking, and daily activity to keep you sharp.",
    btn: "Start Prep",
    route: "/interview-prep",
    status: null,
  },
];

const whyItems = [
  "Understand your current level instantly",
  "Track job applications clearly",
  "Identify and close skill gaps",
  "Stay consistent with structured prep",
];

export default function Home() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    axios
      .get(`${API}/home/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setMessage(res.data.message))
      .catch(() => navigate("/login"));
  }, [navigate]);

  return (
    <>
      <style>{style}</style>
      <div className="home-root">
        <div className="home-container">

          {/* TOPBAR */}
          <div className="home-topbar">
            <div className="home-logo">Career <span>Companion</span></div>
            <div className="home-topbar-right">
              <div className="home-pill">
                <span className="dot" />
                <span>Active workspace</span>
              </div>
            </div>
          </div>

          {/* HERO */}
          <div className="home-hero">
            <div>
              <div className="home-hero-eyebrow">AI-powered career tools</div>
              <h1>
                Your <span className="accent">career,</span><br />
                <span className="italic">elevated.</span>
              </h1>
              <p className="home-hero-sub">
                Plan smarter, track progress, and improve your chances with structured tools built for job seekers.
              </p>
              {message && <div className="home-msg">👋 {message}</div>}
            </div>
            <div className="home-hero-right">
              <div className="home-hero-stats">
                <div className="home-stat">
                  <div className="val">4</div>
                  <div className="lbl">Tools</div>
                </div>
                <div className="home-stat-divider" />
                <div className="home-stat">
                  <div className="val">∞</div>
                  <div className="lbl">Potential</div>
                </div>
              </div>
            </div>
          </div>

          {/* TOOLS */}
          <div className="home-tools">
            <div className="home-section-label">What would you like to work on today?</div>
            <div className="home-grid">
              {tools.map((tool) => (
                <div
                  key={tool.num}
                  className="home-card"
                  onClick={() => tool.route && navigate(tool.route)}
                >
                  <div className="home-card-top">
                    <span className="home-card-num">{tool.num}</span>
                    <div className="home-card-icon">{tool.icon}</div>
                  </div>
                  <h3>{tool.title}</h3>
                  <p>{tool.desc}</p>
                  <div className="home-card-footer">
                    {tool.route ? (
                      <button
                        className="home-btn"
                        onClick={(e) => { e.stopPropagation(); navigate(tool.route); }}
                      >
                        {tool.btn} →
                      </button>
                    ) : (
                      <button
                        className="home-btn-ghost"
                        onClick={(e) => { e.stopPropagation(); alert("Feature in progress"); }}
                      >
                        {tool.btn}
                      </button>
                    )}
                    {tool.status && <span className="home-card-status">{tool.status}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WHY STRIP */}
          <div className="home-strip">
            <div className="home-strip-label">Why this helps</div>
            <div className="home-strip-items">
              {whyItems.map((item, i) => (
                <div key={i} className="home-strip-item">
                  <span className="strip-num">0{i + 1}</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER */}
          <div className="home-footer">
            <p>Built for job seekers who take it seriously.</p>
            <span className="home-footer-accent">CAREER COMPANION</span>
          </div>

        </div>
      </div>
    </>
  );
}