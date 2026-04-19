import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../services/auth";


const style = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0A0A0F;           /* Matches Landing .landing-root */
    --surface: #111118;      /* Matches Landing .card background */
    --border: #1E1E2C;       /* Matches Landing .card border */
    --border-hover: #C8FF57;
    --accent: #C8FF57;
    --accent-dim: rgba(200,255,87,0.06);
    --text: #F0EEE8;
    --muted: #777777;        /* Matches Landing .card p color */
    --faint: #0D0D14;
  }

  .home-root {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow-x: hidden;
  }

  .home-bg-canvas {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
  }

  .home-container {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    position: relative;
    z-index: 1;
  }

  /* TOPBAR */
  .home-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28px 48px;
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(12px);
    background: rgba(10, 10, 15, 0.6); 
  }
  
  .home-logo {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    letter-spacing: -0.02em;
    color: var(--text);
  }
  .home-logo span { color: var(--accent); }
  .home-topbar-right { display: flex; align-items: center; gap: 12px; }
  .home-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(10,14,26,0.8);
    border: 1px solid var(--border);
    border-radius: 100px;
    padding: 6px 14px;
    font-size: 0.78rem;
    color: var(--muted);
    backdrop-filter: blur(8px);
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

  /* HERO */
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
    width: 24px; height: 1px;
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
  .home-hero h1 .italic { font-style: italic; color: var(--muted); font-weight: 400; }
  .home-hero-sub {
    margin-top: 24px;
    font-size: 1rem;
    color: var(--muted);
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
  .home-hero-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; padding-bottom: 4px; }
  .home-stat { text-align: right; }
  .home-stat .val {
    font-family: 'Syne', sans-serif;
    font-size: 2.4rem;
    font-weight: 800;
    color: var(--accent);
    line-height: 1;
  }
  .home-stat .lbl { font-size: 0.72rem; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; }
  .home-stat-divider { width: 1px; height: 40px; background: var(--border); align-self: center; margin: 0 8px; }
  .home-hero-stats { display: flex; align-items: center; gap: 16px; }

  /* SECTION LABEL */
  .home-section-label {
    font-family: 'Syne', sans-serif;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #2a3560;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .home-section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  /* TOOLS GRID */
  .home-tools { padding: 56px 48px; }
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
    transition: background 0.2s ease;
    position: relative;
    overflow: hidden;
    animation: fadeUp 0.5s ease both;
    display: flex;
    flex-direction: column;
    gap: 0;
    backdrop-filter: blur(4px);
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
  .home-card:hover { background: #161620; 
  border-color: var(--accent); }
  .home-card:hover::after { opacity: 1; }
  .home-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; }
  .home-card-num { font-family: 'Syne', sans-serif; font-size: 0.68rem; font-weight: 700; color: #2a3560; letter-spacing: 0.12em; }
  .home-card-icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: var(--faint);
    border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem;
    transition: border-color 0.2s, background 0.2s;
    flex-shrink: 0;
  }
  .home-card:hover .home-card-icon { border-color: var(--accent); background: rgba(200,255,87,0.08); }
  .home-card h3 { font-family: 'Syne', sans-serif; font-size: 1.15rem; font-weight: 700; margin-bottom: 10px; letter-spacing: -0.01em; position: relative; z-index: 1; }
  .home-card p { font-size: 0.85rem; color: #4a5580; line-height: 1.6; font-weight: 300; flex: 1; position: relative; z-index: 1; }
  .home-card-footer { margin-top: 28px; display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 1; }

  .home-btn {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--accent); color: #020818;
    border: none; border-radius: 100px;
    padding: 8px 18px; font-size: 0.8rem; font-weight: 700;
    font-family: 'Syne', sans-serif; cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    letter-spacing: 0.02em;
  }
  .home-btn:hover { transform: scale(1.04); box-shadow: 0 0 20px rgba(200,255,87,0.35); }
  .home-btn-ghost {
    display: inline-flex; align-items: center; gap: 6px;
    background: none; color: var(--muted);
    border: 1px solid var(--border); border-radius: 100px;
    padding: 8px 18px; font-size: 0.8rem; font-weight: 500;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: all 0.15s;
  }
  .home-btn-ghost:hover { border-color: #4a5580; color: #7a88b0; }

  /* WHY STRIP */
  .home-strip {
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 0 48px;
    display: flex; align-items: stretch; gap: 0; overflow: hidden;
    backdrop-filter: blur(4px);
    background: rgba(2,8,24,0.4);
  }
  .home-strip-label {
    font-family: 'Syne', sans-serif; font-size: 0.65rem; font-weight: 700;
    letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent);
    writing-mode: vertical-lr; transform: rotate(180deg);
    padding: 24px 0; border-right: 1px solid var(--border); margin-right: 32px;
    flex-shrink: 0; display: flex; align-items: center;
  }
  .home-strip-items { display: flex; align-items: center; gap: 0; flex: 1; flex-wrap: wrap; }
  .home-strip-item {
    display: flex; align-items: center; gap: 10px;
    padding: 20px 28px 20px 0;
    border-right: 1px solid var(--border);
    font-size: 0.85rem; color: #3a4570; flex-shrink: 0;
    transition: color 0.2s;
  }
  .home-strip-item:last-child { border-right: none; }
  .home-strip-item:hover { color: var(--text); }
  .home-strip-item .strip-num { font-family: 'Syne', sans-serif; font-size: 0.65rem; font-weight: 700; color: var(--accent); opacity: 0.6; }

  /* HOW IT WORKS */
  .home-how { padding: 56px 48px; border-bottom: 1px solid var(--border); }
  .home-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; position: relative; }
  .home-steps::before {
    content: ''; position: absolute;
    top: 28px; left: calc(12.5% + 12px); right: calc(12.5% + 12px);
    height: 1px;
    background: linear-gradient(90deg, var(--accent) 0%, rgba(200,255,87,0.1) 100%);
    z-index: 0;
  }
  .home-step { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0 20px; position: relative; z-index: 1; animation: fadeUp 0.5s ease both; }
  .home-step:nth-child(1) { animation-delay: 0.05s; }
  .home-step:nth-child(2) { animation-delay: 0.12s; }
  .home-step:nth-child(3) { animation-delay: 0.19s; }
  .home-step:nth-child(4) { animation-delay: 0.26s; }
  .home-step-circle {
    width: 56px; height: 56px; border-radius: 50%;
    background: var(--surface); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.1rem;
    color: var(--accent); margin-bottom: 20px;
    transition: border-color 0.2s, background 0.2s;
  }
  .home-step:hover .home-step-circle { border-color: var(--accent); background: rgba(200,255,87,0.08); }
  .home-step h4 { font-family: 'Syne', sans-serif; font-size: 0.9rem; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.01em; }
  .home-step p { font-size: 0.8rem; color: #4a5580; line-height: 1.6; font-weight: 300; }

  /* METRICS */
  .home-metric-cell {
    background: var(--surface);
    padding: 36px 28px;
    display: flex; flex-direction: column; gap: 6px;
    transition: background 0.2s;
    backdrop-filter: blur(4px);
  }
  .home-metric-cell:hover { background: #0d1225; }
  .home-metric-big { font-family: 'Syne', sans-serif; font-size: 3rem; font-weight: 800; color: var(--accent); line-height: 1; letter-spacing: -0.04em; }
  .home-metric-label { font-size: 0.8rem; color: #4a5580; font-weight: 300; line-height: 1.5; }
  .home-metric-sub { font-size: 0.7rem; color: #2a3560; letter-spacing: 0.06em; text-transform: uppercase; font-family: 'Syne', sans-serif; margin-top: 4px; }

  /* TESTIMONIALS */
  .home-testimonials { padding: 56px 48px; border-bottom: 1px solid var(--border); }
  .home-testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; background: var(--border); border-radius: 24px; overflow: hidden; border: 1px solid var(--border); }
  .home-testi-card {
    background: var(--surface); padding: 32px 28px;
    display: flex; flex-direction: column; gap: 20px;
    animation: fadeUp 0.5s ease both; transition: background 0.2s;
    backdrop-filter: blur(4px);
  }
  .home-testi-card:nth-child(1) { animation-delay: 0.05s; border-radius: 22px 0 0 22px; }
  .home-testi-card:nth-child(2) { animation-delay: 0.12s; }
  .home-testi-card:nth-child(3) { animation-delay: 0.19s; border-radius: 0 22px 22px 0; }
  .home-testi-card:hover { background: #0d1225; }
  .home-testi-quote { font-size: 1.4rem; color: var(--accent); opacity: 0.4; font-family: 'Syne', sans-serif; line-height: 1; }
  .home-testi-text { font-size: 0.88rem; color: #4a5580; line-height: 1.7; font-weight: 300; font-style: italic; flex: 1; }
  .home-testi-author { display: flex; align-items: center; gap: 12px; border-top: 1px solid var(--border); padding-top: 20px; }
  .home-testi-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--faint); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-size: 0.65rem; font-weight: 700; color: var(--accent); flex-shrink: 0; }
  .home-testi-name { font-family: 'Syne', sans-serif; font-size: 0.8rem; font-weight: 700; color: var(--text); }
  .home-testi-role { font-size: 0.72rem; color: var(--muted); margin-top: 1px; }

  /* TIPS */
  .home-tips { padding: 56px 48px; border-bottom: 1px solid var(--border); }
  .home-tips-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .home-tip-card { border: 1px solid var(--border); border-radius: 16px; padding: 28px 24px; background: var(--surface); transition: border-color 0.2s, background 0.2s; animation: fadeUp 0.5s ease both; backdrop-filter: blur(4px); }
  .home-tip-card:nth-child(1) { animation-delay: 0.05s; }
  .home-tip-card:nth-child(2) { animation-delay: 0.10s; }
  .home-tip-card:nth-child(3) { animation-delay: 0.15s; }
  .home-tip-card:hover { border-color: rgba(200,255,87,0.3); background: #0d1225; }
  .home-tip-tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(200,255,87,0.07); border: 1px solid rgba(200,255,87,0.15); border-radius: 100px; padding: 4px 10px; font-size: 0.68rem; font-weight: 600; color: var(--accent); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 14px; font-family: 'Syne', sans-serif; }
  .home-tip-card h4 { font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.01em; }
  .home-tip-card p { font-size: 0.82rem; color: #4a5580; line-height: 1.65; font-weight: 300; }

  /* CTA BANNER */
  .home-cta {
    margin: 0 48px 56px;
    border: 1px solid rgba(200,255,87,0.2);
    border-radius: 20px; padding: 52px 48px;
    background: rgba(200,255,87,0.04);
    display: flex; align-items: center; justify-content: space-between;
    gap: 32px; position: relative; overflow: hidden;
    backdrop-filter: blur(8px);
  }
  .home-cta::before {
    content: ''; position: absolute; top: -60px; right: -60px;
    width: 240px; height: 240px; border-radius: 50%;
    background: radial-gradient(circle, rgba(200,255,87,0.07) 0%, transparent 70%);
    pointer-events: none;
  }
  .home-cta-left h2 { font-family: 'Syne', sans-serif; font-size: clamp(1.4rem, 3vw, 2.2rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 10px; }
  .home-cta-left h2 span { color: var(--accent); }
  .home-cta-left p { font-size: 0.9rem; color: #4a5580; font-weight: 300; max-width: 380px; line-height: 1.6; }
  .home-cta-actions { display: flex; gap: 12px; flex-shrink: 0; }

  /* CHECKLIST */
  .home-checklist { padding: 56px 48px; border-bottom: 1px solid var(--border); display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
  .home-checklist-left h2 { font-family: 'Syne', sans-serif; font-size: clamp(1.4rem, 2.5vw, 1.9rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.15; margin-bottom: 14px; }
  .home-checklist-left h2 span { color: var(--accent); }
  .home-checklist-left p { font-size: 0.88rem; color: #4a5580; line-height: 1.65; font-weight: 300; }
  .home-checklist-items { display: flex; flex-direction: column; gap: 0; border: 1px solid var(--border); border-radius: 16px; overflow: hidden; backdrop-filter: blur(4px); }
  .home-check-item { display: flex; align-items: center; gap: 16px; padding: 18px 20px; border-bottom: 1px solid var(--border); font-size: 0.85rem; color: #4a5580; font-weight: 300; transition: background 0.15s, color 0.15s; }
  .home-check-item:last-child { border-bottom: none; }
  .home-check-item:hover { background: var(--faint); color: var(--text); }
  .home-check-box { width: 20px; height: 20px; border-radius: 6px; border: 1px solid #2a3560; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
  .home-check-box.done { background: var(--accent); border-color: var(--accent); }
  .home-check-box.done::after { content: '✓'; font-size: 0.65rem; color: #020818; font-weight: 700; }
  .home-check-label { flex: 1; }
  .home-check-tag { font-family: 'Syne', sans-serif; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); opacity: 0.5; flex-shrink: 0; }

  /* FOOTER */
  .home-footer { padding: 32px 48px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border); backdrop-filter: blur(12px); background: rgba(2,8,24,0.6); }
  .home-footer p { font-size: 0.78rem; color: #2a3560; }
  .home-footer-accent { font-family: 'Syne', sans-serif; font-size: 0.78rem; color: #1a2540; font-weight: 700; letter-spacing: 0.1em; }

  /* ANIMATIONS */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .home-hero { animation: fadeUp 0.5s ease both; }
  .home-topbar { animation: fadeUp 0.4s ease both; }

  /* RESPONSIVE */
  @media (max-width: 900px) {
    .home-steps { grid-template-columns: repeat(2, 1fr); }
    .home-steps::before { display: none; }
    .home-tips-grid { grid-template-columns: 1fr 1fr; }
    .home-testi-grid { grid-template-columns: 1fr; }
    .home-testi-card:nth-child(1) { border-radius: 22px 22px 0 0; }
    .home-testi-card:nth-child(3) { border-radius: 0 0 22px 22px; }
    .home-checklist { grid-template-columns: 1fr; gap: 24px; }
  }
  @media (max-width: 768px) {
    .home-topbar, .home-hero, .home-tools, .home-strip, .home-footer,
    .home-how, .home-testimonials, .home-tips, .home-checklist { padding-left: 20px; padding-right: 20px; }
    .home-cta { margin-left: 20px; margin-right: 20px; flex-direction: column; }
    .home-hero { grid-template-columns: 1fr; }
    .home-hero-right { display: none; }
    .home-grid { grid-template-columns: 1fr; }
    .home-card:nth-child(1) { border-radius: 22px 22px 0 0; }
    .home-card:nth-child(2), .home-card:nth-child(3) { border-radius: 0; }
    .home-card:nth-child(4) { border-radius: 0 0 22px 22px; }
    .home-strip-label { display: none; }
    .home-strip-item { padding: 16px 20px 16px 0; font-size: 0.8rem; }
    .home-steps { grid-template-columns: 1fr; }
    .home-tips-grid { grid-template-columns: 1fr; }
    .home-cta-actions { flex-direction: column; width: 100%; }
  }
`;

/* ── DATA ── */
const tools = [
  { num: "01", icon: "⚡", title: "Resume–JD Matcher", desc: "Compare your resume with job descriptions and instantly surface missing skills and keyword gaps.", btn: "Start Matching", route: "/matcher" },
  { num: "02", icon: "🤖", title: "Ai-Interview", desc: "Practice interviews, get AI-powered feedback on your responses, and receive actionable insights to improve confidence, clarity, and performance.", btn: "Interview With Ai", route: "/ai-interview" },
  { num: "03", icon: "📌", title: "Job Tracker", desc: "Manage applications, deadlines, and follow-ups in one clean, distraction-free dashboard.", btn: "Track Jobs", route: "/jobs" },
  { num: "04", icon: "🎯", title: "Interview Prep", desc: "Structured learning paths, topic-wise progress tracking, and daily activity to keep you sharp.", btn: "Start Prep", route: "/interview-prep" },
];

const whyItems = [
  "Understand your current level instantly",
  "Track job applications clearly",
  "Identify and close skill gaps",
  "Stay consistent with structured prep",
];

const steps = [
  { num: "1", title: "Upload your resume", desc: "Drop in your latest CV to get an instant baseline analysis." },
  { num: "2", title: "Paste a job description", desc: "Let the matcher identify gaps between your profile and the role." },
  { num: "3", title: "Practice interviews", desc: "Run AI mock sessions tailored to the specific role and company." },
  { num: "4", title: "Track & land the job", desc: "Monitor every application and follow-up until you get the offer." },
];

const metrics = [
  { val: "3×", label: "faster gap identification vs manual review", sub: "Resume Matcher" },
  { val: "94%", label: "of users felt more prepared after AI interviews", sub: "AI Interview" },
  { val: "2 min", label: "average time to set up a new job application", sub: "Job Tracker" },
  { val: "∞", label: "interview questions across all domains", sub: "Interview Prep" },
];

const testimonials = [
  { initials: "AK", text: "The resume matcher flagged skills I'd completely forgotten to mention. Got a callback the same week I updated my CV.", name: "Aryan K.", role: "SWE — landed at a Series B startup" },
  { initials: "PS", text: "Doing five AI mock interviews before the real one was a game-changer. I went in knowing exactly where I stumbled.", name: "Priya S.", role: "Product Manager — hired at a FAANG" },
  { initials: "MR", text: "The job tracker kept me sane during a 3-month search. No more messy spreadsheets or forgotten follow-ups.", name: "Marcus R.", role: "Data Analyst — offer accepted" },
];

const tips = [
  { tag: "Resume", title: "Tailor every single application", desc: "Generic resumes get filtered out fast. Use the matcher to mirror the exact language in each JD — ATS systems rank keyword density heavily." },
  { tag: "Interview", title: "Use the STAR method consistently", desc: "Situation, Task, Action, Result. Structure every behavioural answer this way and you'll sound confident even when improvising." },
  { tag: "Strategy", title: "Apply in focused sprints", desc: "Sending 50 low-effort applications wastes more time than 10 targeted ones. Use the tracker to stay focused on quality over volume." },
  { tag: "Mindset", title: "Track rejections, not just wins", desc: "Every rejection carries signal. Log the stage at which you dropped out — patterns reveal where to focus your prep energy." },
  { tag: "Research", title: "Know the company cold", desc: "Interviewers can always tell who've done homework. Research recent news, the team's mission, and product direction before any call." },
  { tag: "Follow-up", title: "Send a note within 24 hours", desc: "A concise thank-you email referencing a specific moment from the interview stands out. Most candidates skip it — don't be most candidates." },
];

const checklist = [
  { label: "Resume uploaded and matched against a JD", done: false, tag: "Step 1" },
  { label: "AI mock interview completed at least once", done: false, tag: "Step 2" },
  { label: "First job application added to tracker", done: false, tag: "Step 3" },
  { label: "Interview prep path selected", done: false, tag: "Step 4" },
  { label: "Follow-up reminders set for active applications", done: false, tag: "Step 5" },
  { label: "Weak skill areas identified and noted", done: false, tag: "Step 6" },
];

/* ─────────────────────────────────────────────
   PLEXUS ANIMATION HOOK
───────────────────────────────────────────── */
function usePlexusAnimation(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const rnd = (a, b) => a + (b - a) * Math.random();
    const NODE_COLORS  = ["#00d4ff", "#0066ff", "#3040ff", "#00aaff", "#60b8ff"];
    const PULSE_COLORS = ["#00ffff", "#00d4ff", "#ffffff", "#80eeff"];
    const FLARE_COLORS = ["rgba(0,200,255,", "rgba(100,160,255,", "rgba(180,220,255,"];
    const CONN_DIST = 170;
    const NUM_NODES = 65;

    /* build nodes */
    const nodes = Array.from({ length: NUM_NODES }, () => {
      const depth = rnd(0.2, 1.0);
      return {
        x: rnd(0, canvas.width),
        y: rnd(0, canvas.height),
        z: depth,
        vx: rnd(-0.2, 0.2) * (1 - depth * 0.5),
        vy: rnd(-0.14, 0.14) * (1 - depth * 0.5),
        r: rnd(1.5, 4.5) * depth,
        col: NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)],
        phase: rnd(0, Math.PI * 2),
        bokeh: depth < 0.4,
      };
    });

    function makePulse() {
      for (let tries = 0; tries < 40; tries++) {
        const a = Math.floor(Math.random() * nodes.length);
        const b = Math.floor(Math.random() * nodes.length);
        if (a === b) continue;
        const dx = nodes[b].x - nodes[a].x;
        const dy = nodes[b].y - nodes[a].y;
        if (Math.sqrt(dx * dx + dy * dy) < CONN_DIST) {
          return {
            a, b,
            p: Math.random(),
            speed: rnd(0.003, 0.009),
            col: PULSE_COLORS[Math.floor(Math.random() * PULSE_COLORS.length)],
            size: rnd(2, 5),
          };
        }
      }
      return { a: 0, b: 1, p: 0, speed: 0.005, col: "#00d4ff", size: 3 };
    }

    const pulses = Array.from({ length: 20 }, makePulse);
    let flares = [];
    let edges  = [];
    let t = 0, frame = 0;
    let raf;

    function buildEdges() {
      edges = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < CONN_DIST) edges.push({ i, j, d });
        }
      }
    }

    function drawBg() {
      // Change from #020818 to #0A0A0F
      ctx.fillStyle = "#0A0A0F"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const g = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.4, 0,
        canvas.width * 0.5, canvas.height * 0.4, canvas.width * 0.65
      );
      // Adjusted the glow to be subtler for the darker background
      g.addColorStop(0, "rgba(20, 20, 35, 0.5)"); 
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawEdges() {
      for (const e of edges) {
        const ni = nodes[e.i], nj = nodes[e.j];
        const alpha = (1 - e.d / CONN_DIST) * 0.35 * Math.min(ni.z, nj.z);
        ctx.beginPath();
        ctx.moveTo(ni.x, ni.y);
        ctx.lineTo(nj.x, nj.y);
        ctx.strokeStyle = `rgba(0,160,255,${alpha.toFixed(3)})`;
        ctx.lineWidth = 0.6 * Math.min(ni.z, nj.z);
        ctx.stroke();
      }
    }

    function drawNodes() {
      for (const n of nodes) {
        const glow = Math.sin(t * 0.04 + n.phase) * 0.3 + 0.7;

        if (n.bokeh) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,140,255,0.04)";
          ctx.fill();
        }

        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        g.addColorStop(0, n.col + "bb");
        g.addColorStop(0.4, n.col + "44");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.globalAlpha = glow * n.z;
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.bokeh ? "rgba(100,180,255,0.3)" : n.col;
        ctx.globalAlpha = n.bokeh ? 0.45 : n.z * glow;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    function drawPulses() {
      for (const pu of pulses) {
        const na = nodes[pu.a], nb = nodes[pu.b];
        const x = na.x + (nb.x - na.x) * pu.p;
        const y = na.y + (nb.y - na.y) * pu.p;
        const depth = (na.z + nb.z) * 0.5;

        const g = ctx.createRadialGradient(x, y, 0, x, y, pu.size * 6);
        g.addColorStop(0, pu.col + "ff");
        g.addColorStop(0.3, pu.col + "99");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(x, y, pu.size * 6, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.globalAlpha = 0.9 * depth;
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.beginPath();
        ctx.arc(x, y, pu.size * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = depth;
        ctx.fill();
        ctx.globalAlpha = 1;

        pu.p += pu.speed;
        if (pu.p > 1) Object.assign(pu, makePulse());
      }
    }

    function drawFlares() {
      for (const f of flares) {
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
        g.addColorStop(0, f.col + (f.life * 0.5).toFixed(3) + ")");
        g.addColorStop(0.5, f.col + (f.life * 0.1).toFixed(3) + ")");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        const angles = [0, Math.PI*0.5, Math.PI, Math.PI*1.5, Math.PI*0.25, Math.PI*0.75, Math.PI*1.25, Math.PI*1.75];
        for (const a of angles) {
          ctx.beginPath();
          ctx.moveTo(f.x, f.y);
          ctx.lineTo(f.x + Math.cos(a) * f.r * 1.8 * f.life, f.y + Math.sin(a) * f.r * 1.8 * f.life);
          ctx.strokeStyle = f.col + (f.life * 0.15).toFixed(3) + ")";
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
        f.life -= f.decay;
      }
      flares = flares.filter((f) => f.life > 0);

      if (Math.random() < 0.018) {
        const n = nodes[Math.floor(Math.random() * nodes.length)];
        flares.push({
          x: n.x, y: n.y, life: 1,
          decay: rnd(0.012, 0.025),
          r: rnd(30, 100),
          col: FLARE_COLORS[Math.floor(Math.random() * FLARE_COLORS.length)],
        });
      }
    }

    function loop() {
      t++;
      frame++;

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = canvas.width + 20;
        if (n.x > canvas.width + 20) n.x = -20;
        if (n.y < -20) n.y = canvas.height + 20;
        if (n.y > canvas.height + 20) n.y = -20;
      }

      if (frame % 3 === 0) buildEdges();

      drawBg();
      drawEdges();
      drawFlares();
      drawNodes();
      drawPulses();

      raf = requestAnimationFrame(loop);
    }

    buildEdges();
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef]);
}

/* ─────────────────────────────────────────────
   HOME COMPONENT
───────────────────────────────────────────── */
export default function Home() {
  const [message, setMessage] = useState("");
  const navigate   = useNavigate();
  const canvasRef  = useRef(null);

  usePlexusAnimation(canvasRef);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await API.get("me/");
        setMessage(`Welcome back, ${res.data.username}`);
      } catch {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <>
      <style>{style}</style>
      <div className="home-root">

        {/* ── PLEXUS BACKGROUND ── */}
        <canvas ref={canvasRef} className="home-bg-canvas" />

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
                <div key={tool.num} className="home-card" onClick={() => tool.route && navigate(tool.route)}>
                  <div className="home-card-top">
                    <span className="home-card-num">{tool.num}</span>
                    <div className="home-card-icon">{tool.icon}</div>
                  </div>
                  <h3>{tool.title}</h3>
                  <p>{tool.desc}</p>
                  <div className="home-card-footer">
                    {tool.route ? (
                      <button className="home-btn" onClick={(e) => { e.stopPropagation(); navigate(tool.route); }}>
                        {tool.btn} →
                      </button>
                    ) : (
                      <button className="home-btn-ghost" onClick={(e) => { e.stopPropagation(); alert("Feature in progress"); }}>
                        {tool.btn}
                      </button>
                    )}
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

          {/* HOW IT WORKS */}
          <div className="home-how">
            <div className="home-section-label">How it works</div>
            <div className="home-steps">
              {steps.map((s) => (
                <div key={s.num} className="home-step">
                  <div className="home-step-circle">{s.num}</div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* METRICS */}
          <div style={{ padding: "0 48px 56px", borderBottom: "1px solid var(--border)" }}>
            <div className="home-section-label">By the numbers</div>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
              gap: "2px", background: "var(--border)",
              borderRadius: "20px", overflow: "hidden", border: "1px solid var(--border)",
            }}>
              {metrics.map((m, i) => (
                <div key={i} className="home-metric-cell">
                  <div className="home-metric-big">{m.val}</div>
                  <div className="home-metric-label">{m.label}</div>
                  <div className="home-metric-sub">{m.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* TESTIMONIALS */}
          <div className="home-testimonials">
            <div className="home-section-label">What users say</div>
            <div className="home-testi-grid">
              {testimonials.map((t, i) => (
                <div key={i} className="home-testi-card">
                  <div className="home-testi-quote">"</div>
                  <p className="home-testi-text">{t.text}</p>
                  <div className="home-testi-author">
                    <div className="home-testi-avatar">{t.initials}</div>
                    <div>
                      <div className="home-testi-name">{t.name}</div>
                      <div className="home-testi-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TIPS */}
          <div className="home-tips">
            <div className="home-section-label">Quick tips for job seekers</div>
            <div className="home-tips-grid">
              {tips.map((tip, i) => (
                <div key={i} className="home-tip-card">
                  <div className="home-tip-tag">{tip.tag}</div>
                  <h4>{tip.title}</h4>
                  <p>{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CHECKLIST */}
          <div className="home-checklist">
            <div className="home-checklist-left">
              <h2>Your <span>getting started</span> checklist</h2>
              <p>New here? Work through these six steps to get the most out of Career Companion. Each one takes less than five minutes and builds on the last.</p>
            </div>
            <div className="home-checklist-items">
              {checklist.map((item, i) => (
                <div key={i} className="home-check-item">
                  <div className={`home-check-box${item.done ? " done" : ""}`} />
                  <span className="home-check-label">{item.label}</span>
                  <span className="home-check-tag">{item.tag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="home-cta">
            <div className="home-cta-left">
              <h2>Ready to land your <span>next role?</span></h2>
              <p>Pick a tool and start — you're already ahead of anyone who hasn't.</p>
            </div>
            <div className="home-cta-actions">
              <button className="home-btn" onClick={() => navigate("/matcher")}>Match my resume →</button>
              <button className="home-btn-ghost" onClick={() => navigate("/ai-interview")}>Practice an interview</button>
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