import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;

const API = "https://career-companion-backend-uhlf.onrender.com/interview-prep";

const roleIcons = ["⚙️", "🧠", "🖥️", "📐", "🔬", "🎯", "🛠️", "🚀"];
const topicGradients = [
  ["#FF6B6B", "#FF8E53"],
  ["#4ECDC4", "#44A08D"],
  ["#A18CD1", "#FBC2EB"],
  ["#FDDB92", "#D1FDFF"],
  ["#A1C4FD", "#C2E9FB"],
  ["#FD746C", "#FF9068"],
  ["#43E97B", "#38F9D7"],
  ["#F093FB", "#F5576C"],
];

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const style = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .ip-root {
    min-height: 100vh;
    background: #0A0A0F;
    color: #F0EEE8;
    font-family: 'DM Sans', sans-serif;
    overflow-x: hidden;
  }

  /* HEADER */
  .ip-header {
    padding: 48px 48px 0;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }
  .ip-header-left h1 {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: clamp(2rem, 4vw, 3.2rem);
    letter-spacing: -0.03em;
    line-height: 1;
  }
  .ip-header-left h1 span { color: #C8FF57; }
  .ip-header-left p { margin-top: 8px; font-size: 0.95rem; color: #888; font-weight: 300; }
  .ip-streak {
    display: flex; align-items: center; gap: 8px;
    background: #1A1A24; border: 1px solid #2A2A38;
    border-radius: 100px; padding: 10px 20px;
    font-size: 0.85rem; font-weight: 500;
  }
  .ip-streak .flame { font-size: 1.2rem; }
  .ip-streak .count { color: #C8FF57; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.1rem; }

  /* TABS */
  .ip-tabs { display: flex; gap: 4px; padding: 32px 48px 0; }
  .ip-tab {
    background: none; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 500;
    padding: 8px 20px; border-radius: 100px; color: #555; transition: all 0.2s;
  }
  .ip-tab.active { background: #C8FF57; color: #0A0A0F; font-weight: 700; }
  .ip-tab:hover:not(.active) { color: #F0EEE8; }

  /* MAIN */
  .ip-main { padding: 40px 48px 80px; }
  .ip-label {
    font-family: 'Syne', sans-serif; font-size: 0.7rem; font-weight: 700;
    letter-spacing: 0.15em; text-transform: uppercase; color: #444; margin-bottom: 20px;
  }

  /* ROLE CARDS */
  .ip-roles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; margin-bottom: 56px; }
  .ip-role-card {
    background: #111118; border: 1px solid #1E1E2C; border-radius: 20px;
    padding: 28px; cursor: pointer; transition: all 0.25s ease; position: relative; overflow: hidden;
  }
  .ip-role-card::before {
    content: ''; position: absolute; inset: 0; border-radius: 20px; opacity: 0;
    transition: opacity 0.25s; background: linear-gradient(135deg, rgba(200,255,87,0.07), transparent);
  }
  .ip-role-card:hover::before { opacity: 1; }
  .ip-role-card:hover { border-color: #C8FF57; transform: translateY(-3px); }
  .ip-role-card.selected { border-color: #C8FF57; background: #111A0D; }
  .ip-role-icon { font-size: 2rem; margin-bottom: 14px; display: block; }
  .ip-role-card h4 { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 700; margin-bottom: 6px; }
  .ip-role-card p { font-size: 0.85rem; color: #666; line-height: 1.5; }
  .ip-role-badge {
    position: absolute; top: 16px; right: 16px;
    background: #C8FF57; color: #0A0A0F; font-size: 0.65rem; font-weight: 700;
    font-family: 'Syne', sans-serif; letter-spacing: 0.08em;
    padding: 4px 10px; border-radius: 100px; text-transform: uppercase;
  }
  .ip-role-badge.soon { background: #2A2A38; color: #555; }
  /* mini bar inside role card */
  .ip-role-mini-bar { margin-top: 16px; }
  .ip-role-mini-bar-track { height: 3px; background: #1E1E2C; border-radius: 100px; overflow: hidden; }
  .ip-role-mini-bar-fill { height: 100%; background: #C8FF57; border-radius: 100px; transition: width 0.6s ease; }
  .ip-role-mini-bar-label { font-size: 0.72rem; color: #555; margin-top: 6px; }

  /* BACK BTN */
  .ip-back {
    display: inline-flex; align-items: center; gap: 8px;
    background: none; border: 1px solid #2A2A38; color: #888;
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
    padding: 8px 16px; border-radius: 100px; cursor: pointer; transition: all 0.2s; margin-bottom: 28px;
  }
  .ip-back:hover { border-color: #888; color: #F0EEE8; }

  /* DASHBOARD GRID */
  .ip-dash { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }

  /* CARD */
  .ip-card {
    background: #111118; border: 1px solid #1E1E2C; border-radius: 20px; padding: 28px; margin-bottom: 20px;
  }
  .ip-card-title {
    font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700;
    margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;
  }
  .ip-card-title .badge {
    font-size: 0.7rem; font-weight: 600; color: #555;
    background: #1A1A24; padding: 3px 10px; border-radius: 100px;
  }

  /* TOPIC BARS */
  .ip-topic-row { margin-bottom: 20px; }
  .ip-topic-row:last-child { margin-bottom: 0; }
  .ip-topic-row-header {
    display: flex; justify-content: space-between; align-items: baseline;
    margin-bottom: 8px;
  }
  .ip-topic-row-name { font-size: 0.9rem; font-weight: 500; }
  .ip-topic-row-pct { font-family: 'Syne', sans-serif; font-size: 0.85rem; font-weight: 700; color: #C8FF57; }
  .ip-topic-row-pct.dim { color: #333; }
  .ip-topic-track { height: 8px; background: #1A1A24; border-radius: 100px; overflow: hidden; cursor: pointer; }
  .ip-topic-track:hover { background: #222230; }
  .ip-topic-fill { height: 100%; border-radius: 100px; transition: width 0.7s cubic-bezier(0.34,1.56,0.64,1); }
  .ip-topic-meta { font-size: 0.72rem; color: #444; margin-top: 4px; }

  /* RING (overall) */
  .ip-ring-row { display: flex; align-items: center; gap: 28px; }
  .ip-ring-wrap { position: relative; flex-shrink: 0; }
  .ip-ring-wrap svg { transform: rotate(-90deg); }
  .ip-ring-label {
    position: absolute; inset: 0; display: flex; flex-direction: column;
    align-items: center; justify-content: center; font-family: 'Syne', sans-serif;
  }
  .ip-ring-label .pct { font-size: 1.6rem; font-weight: 800; color: #C8FF57; }
  .ip-ring-label .sub { font-size: 0.6rem; color: #555; }
  .ip-ring-stats { display: flex; flex-direction: column; gap: 12px; flex: 1; }
  .ip-stat-pill {
    display: flex; align-items: center; justify-content: space-between;
    background: #0A0A0F; border: 1px solid #1A1A24; border-radius: 12px; padding: 12px 16px;
  }
  .ip-stat-pill-label { font-size: 0.8rem; color: #666; }
  .ip-stat-pill-val { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1rem; }

  /* HEATMAP */
  .ip-heatmap-grid { display: grid; grid-template-columns: repeat(15, 1fr); gap: 5px; margin-bottom: 12px; }
  .ip-hm-cell {
    aspect-ratio: 1; border-radius: 4px; background: #1A1A24;
    transition: all 0.2s; cursor: default; position: relative;
  }
  .ip-hm-cell.lv1 { background: #1F2E10; }
  .ip-hm-cell.lv2 { background: #2D4015; }
  .ip-hm-cell.lv3 { background: #4A6B1A; }
  .ip-hm-cell.lv4 { background: #C8FF57; }
  .ip-hm-cell.today { outline: 2px solid #C8FF57; outline-offset: 2px; }
  .ip-hm-cell:hover .ip-hm-tooltip { display: block; }
  .ip-hm-tooltip {
    display: none; position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%);
    background: #222; border: 1px solid #333; border-radius: 8px; padding: 6px 10px;
    font-size: 0.7rem; white-space: nowrap; z-index: 10; color: #F0EEE8; pointer-events: none;
  }
  .ip-hm-legend { display: flex; align-items: center; gap: 6px; font-size: 0.72rem; color: #444; }
  .ip-hm-legend-dots { display: flex; gap: 4px; }
  .ip-hm-dot { width: 10px; height: 10px; border-radius: 2px; }

  /* BAR CHART (weekly activity) */
  .ip-bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 80px; }
  .ip-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .ip-bar-track { flex: 1; width: 100%; background: #1A1A24; border-radius: 6px 6px 0 0; position: relative; overflow: hidden; display: flex; align-items: flex-end; }
  .ip-bar-fill { width: 100%; background: linear-gradient(to top, #C8FF57, #9AE000); border-radius: 6px 6px 0 0; transition: height 0.6s cubic-bezier(0.34,1.56,0.64,1); }
  .ip-bar-day { font-size: 0.65rem; color: #444; }
  .ip-bar-val { font-family: 'Syne', sans-serif; font-size: 0.65rem; font-weight: 700; color: #888; }

  /* SIDEBAR */
  .ip-sidebar { display: flex; flex-direction: column; gap: 20px; position: sticky; top: 32px; }

  /* TOPIC DETAIL CARD */
  .ip-detail-header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
  .ip-detail-dot { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; }
  .ip-detail-header h3 { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; }
  .ip-todo-row {
    display: flex; align-items: center; gap: 12px; padding: 10px 0;
    border-bottom: 1px solid #1A1A24; font-size: 0.85rem;
  }
  .ip-todo-row:last-child { border-bottom: none; }
  .ip-todo-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .ip-todo-dot.done { background: #C8FF57; }
  .ip-todo-dot.undone { background: #2A2A38; }
  .ip-todo-label { flex: 1; line-height: 1.4; }
  .ip-todo-label.done { color: #444; text-decoration: line-through; }
  .ip-check-badge { font-size: 0.7rem; background: #1F2E10; color: #C8FF57; padding: 2px 8px; border-radius: 100px; flex-shrink: 0; }
  .ip-todo-check {
    width: 20px; height: 20px; border-radius: 50%;
    border: 2px solid #2A2A38; background: none;
    flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    transition: all 0.2s; font-size: 0.7rem; color: #0A0A0F;
    outline: none; padding: 0;
  }
  .ip-todo-check:hover:not(.checked) { border-color: #C8FF57; background: rgba(200,255,87,0.08); }
  .ip-todo-check.checked { background: #C8FF57; border-color: #C8FF57; cursor: pointer; }
  .ip-todo-check.checked:hover { background: #a8d93e; border-color: #a8d93e; }

  /* EMPTY */
  .ip-empty { text-align: center; padding: 60px 20px; color: #444; }
  .ip-empty .big { font-size: 3rem; display: block; margin-bottom: 12px; }

  /* ANIM */
  @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .ip-role-card { animation: fadeSlideUp 0.35s ease both; }
  .ip-role-card:nth-child(2) { animation-delay: 0.05s; }
  .ip-role-card:nth-child(3) { animation-delay: 0.10s; }
  .ip-role-card:nth-child(4) { animation-delay: 0.15s; }
  .ip-card { animation: fadeSlideUp 0.3s ease both; }

  @media (max-width: 900px) {
    .ip-header, .ip-tabs, .ip-main { padding-left: 20px; padding-right: 20px; }
    .ip-dash { grid-template-columns: 1fr; }
    .ip-sidebar { position: static; }
    .ip-heatmap-grid { grid-template-columns: repeat(10, 1fr); }
  }
`;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function RingChart({ pct, size = 120, stroke = 10 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (pct / 100) * circ;
  return (
    <div className="ip-ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1A1A24" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="#C8FF57" strokeWidth={stroke}
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.34,1.56,0.64,1)" }}
        />
      </svg>
      <div className="ip-ring-label">
        <span className="pct">{pct}%</span>
        <span className="sub">done</span>
      </div>
    </div>
  );
}

function TopicBar({ topic, idx, completedCount, totalCount, onClick, selected }) {
  const pct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const [c1, c2] = topicGradients[idx % topicGradients.length];
  return (
    <div className="ip-topic-row" onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="ip-topic-row-header">
        <span className="ip-topic-row-name" style={selected ? { color: c1 } : {}}>{topic.name}</span>
        <span className={`ip-topic-row-pct${pct === 0 ? " dim" : ""}`}>{pct}%</span>
      </div>
      <div className="ip-topic-track">
        <div
          className="ip-topic-fill"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${c1}, ${c2})` }}
        />
      </div>
      <div className="ip-topic-meta">{completedCount} / {totalCount} tasks done</div>
    </div>
  );
}

function HeatmapCell({ entry, isToday }) {
  let cls = "ip-hm-cell";
  if (entry) {
    const n = entry.tasks_completed;
    if (n >= 8) cls += " lv4";
    else if (n >= 5) cls += " lv3";
    else if (n >= 2) cls += " lv2";
    else if (n >= 1) cls += " lv1";
  }
  if (isToday) cls += " today";
  return (
    <div className={cls}>
      {entry && <span className="ip-hm-tooltip">{entry.date}: {entry.tasks_completed} tasks</span>}
    </div>
  );
}

function WeeklyBar({ calendar }) {
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const today = new Date();
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const entry = calendar.find(c => c.date === key);
    return { day: days[d.getDay()], val: entry ? entry.tasks_completed : 0, isToday: i === 6 };
  });
  const max = Math.max(...week.map(w => w.val), 1);
  return (
    <div className="ip-bar-chart">
      {week.map((w, i) => (
        <div key={i} className="ip-bar-col">
          <span className="ip-bar-val">{w.val > 0 ? w.val : ""}</span>
          <div className="ip-bar-track">
            <div className="ip-bar-fill" style={{ height: `${(w.val / max) * 100}%`, opacity: w.isToday ? 1 : 0.55 }} />
          </div>
          <span className="ip-bar-day" style={w.isToday ? { color: "#C8FF57" } : {}}>{w.day}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function InterviewPrep() {
  
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);

  // topics with their todo counts
  const [topicsData, setTopicsData] = useState([]); // [{topic, todos: []}]

  const [calendar, setCalendar] = useState([]);
  const [selectedTopicIdx, setSelectedTopicIdx] = useState(null);
  const [loading, setLoading] = useState(false);

  const dashRef = useRef(null);

  /* FETCH ROLES — merge API data with guaranteed Data Scientist card */
  const fetchRoles = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/roles/`,{ withCredentials: true });
      const apiRoles = res.data;
      // Ensure Data Scientist is always present
      const hasDS = apiRoles.some(r => r.name.toLowerCase().includes("data scientist"));
      if (!hasDS) {
        apiRoles.push({ id: "__ds__", name: "Data Scientist", description: "ML, statistics, Python, SQL, and more.", _placeholder: true });
      }
      setRoles(apiRoles);
    } catch (err) { console.error(err); }
  }, []);

  /* FETCH CALENDAR */
  const fetchCalendar = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/calendar/`,{ withCredentials: true });
      setCalendar(res.data);
    } catch (err) { console.error(err); }
  }, []);

  /* SELECT ROLE → fetch topics + todos for each */
  const selectRole = async (role) => {
    if (role._placeholder) {
      alert("Data Scientist role hasn't been added to the database yet. Add it via the Django admin and it will appear here automatically.");
      return;
    }
    setSelectedRole(role);
    setSelectedTopicIdx(null);
    setLoading(true);
    try {
      const topicsRes = await axios.get(`${API}/roles/${role.id}/topics/`,{ withCredentials: true });
      const topics = topicsRes.data;
      // Fetch todos for every topic in parallel
      const allTodos = await Promise.all(
        topics.map(t => axios.get(`${API}/topics/${t.id}/todos/`,{ withCredentials: true }).then(r => r.data))
      );
      setTopicsData(topics.map((t, i) => ({ topic: t, todos: allTodos[i] || [] })));
      setTimeout(() => dashRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchRoles(); fetchCalendar(); }, []);

  /* DERIVED STATS */
  const totalTodos = topicsData.reduce((s, d) => s + d.todos.length, 0);
  const completedTodos = topicsData.reduce((s, d) => s + d.todos.filter(t => t.completed).length, 0);
  const overallPct = totalTodos === 0 ? 0 : Math.round((completedTodos / totalTodos) * 100);
  const streakDays = (() => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (calendar.find(c => c.date === key && c.tasks_completed > 0)) streak++;
      else if (i > 0) break;
    }
    return streak;
  })();

  const heatmapDays = (() => {
    const days = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ key, entry: calendar.find(c => c.date === key) || null, isToday: i === 0 });
    }
    return days;
  })();

  const totalCalTasks = calendar.reduce((s, c) => s + c.tasks_completed, 0);
  const selectedTopic = selectedTopicIdx !== null ? topicsData[selectedTopicIdx] : null;

  /* Optimistically bump/decrement today's calendar entry */
  const bumpCalendarToday = (delta) => {
    const todayKey = new Date().toISOString().slice(0, 10);
    setCalendar(prev => {
      const exists = prev.find(c => c.date === todayKey);
      if (exists) {
        return prev.map(c => c.date === todayKey
          ? { ...c, tasks_completed: Math.max(0, c.tasks_completed + delta) }
          : c
        );
      }
      return delta > 0 ? [...prev, { date: todayKey, tasks_completed: delta }] : prev;
    });
  };

  /* TOGGLE A TODO — complete or uncomplete locally + API for completion */
  const toggleTodo = async (topicIdx, todoId, currentlyCompleted) => {
    const newState = !currentlyCompleted;

    // Optimistic UI update
    setTopicsData(prev => prev.map((d, i) =>
      i !== topicIdx ? d : { ...d, todos: d.todos.map(t => t.id === todoId ? { ...t, completed: newState } : t) }
    ));
    // Update weekly bar immediately
    bumpCalendarToday(newState ? 1 : -1);

    if (newState) {
      // Completing → call API
      try {
        await axios.post(`${API}/todos/${todoId}/complete/`, {},  { withCredentials: true } );
        // Sync calendar from server to stay accurate
        fetchCalendar();
      } catch (err) {
        console.error(err);
        // Revert
        setTopicsData(prev => prev.map((d, i) =>
          i !== topicIdx ? d : { ...d, todos: d.todos.map(t => t.id === todoId ? { ...t, completed: false } : t) }
        ));
        bumpCalendarToday(-1);
      }
    }
    // Uncompleting: backend has no endpoint, state is already toggled locally above
  };

  return (
    <>
      <style>{style}</style>
      <div className="ip-root">
        {/* HEADER */}
        <header className="ip-header">
          <div className="ip-header-left">
            <h1>Interview <span>Prep</span></h1>
            <p>Track your progress, topic by topic.</p>
          </div>
          <div className="ip-streak">
            <span className="flame">🔥</span>
            <span className="count">{streakDays}</span>
            <span style={{ color: "#555" }}>day streak</span>
          </div>
        </header>

        {/* MAIN */}
        <main className="ip-main">

          {/* ROLES */}
          <div className="ip-label">Choose a role</div>
          <div className="ip-roles-grid">
            {roles.map((role, i) => {
              const rTopics = selectedRole?.id === role.id ? topicsData : [];
              const rTotal = rTopics.reduce((s, d) => s + d.todos.length, 0);
              const rDone = rTopics.reduce((s, d) => s + d.todos.filter(t => t.completed).length, 0);
              const rPct = rTotal === 0 ? 0 : Math.round((rDone / rTotal) * 100);
              return (
                <div
                  key={role.id}
                  className={`ip-role-card${selectedRole?.id === role.id ? " selected" : ""}`}
                  onClick={() => selectRole(role)}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {selectedRole?.id === role.id && <span className="ip-role-badge">Active</span>}
                  {role._placeholder && <span className="ip-role-badge soon">Coming Soon</span>}
                  <span className="ip-role-icon" style={role._placeholder ? { filter: "grayscale(1)", opacity: 0.4 } : {}}>{roleIcons[i % roleIcons.length]}</span>
                  <h4>{role.name}</h4>
                  <p>{role.description || "Click to explore topics and track progress."}</p>
                  {selectedRole?.id === role.id && rTotal > 0 && (
                    <div className="ip-role-mini-bar">
                      <div className="ip-role-mini-bar-track">
                        <div className="ip-role-mini-bar-fill" style={{ width: `${rPct}%` }} />
                      </div>
                      <div className="ip-role-mini-bar-label">{rPct}% complete</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* DASHBOARD */}
          {selectedRole && (
            <div ref={dashRef}>
              <button className="ip-back" onClick={() => { setSelectedRole(null); setTopicsData([]); setSelectedTopicIdx(null); }}>
                ← Back
              </button>

              {loading ? (
                <div className="ip-empty"><span className="big">⏳</span><p>Loading data…</p></div>
              ) : (
                <div className="ip-dash">
                  {/* LEFT COLUMN */}
                  <div>
                    {/* OVERALL PROGRESS */}
                    <div className="ip-card">
                      <div className="ip-card-title">
                        Overall Progress
                        <span className="badge">{selectedRole.name}</span>
                      </div>
                      <div className="ip-ring-row">
                        <RingChart pct={overallPct} size={130} stroke={11} />
                        <div className="ip-ring-stats">
                          <div className="ip-stat-pill">
                            <span className="ip-stat-pill-label">Topics</span>
                            <span className="ip-stat-pill-val">{topicsData.length}</span>
                          </div>
                          <div className="ip-stat-pill">
                            <span className="ip-stat-pill-label">Completed tasks</span>
                            <span className="ip-stat-pill-val" style={{ color: "#C8FF57" }}>{completedTodos} / {totalTodos}</span>
                          </div>
                          <div className="ip-stat-pill">
                            <span className="ip-stat-pill-label">Total tasks done (all time)</span>
                            <span className="ip-stat-pill-val">{totalCalTasks}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* TOPIC PROGRESS BARS */}
                    <div className="ip-card">
                      <div className="ip-card-title">
                        Topic Breakdown
                        <span className="badge">click to inspect</span>
                      </div>
                      {topicsData.length === 0
                        ? <div className="ip-empty"><p>No topics found for this role.</p></div>
                        : topicsData.map((d, i) => {
                            const done = d.todos.filter(t => t.completed).length;
                            return (
                              <TopicBar
                                key={d.topic.id}
                                topic={d.topic}
                                idx={i}
                                completedCount={done}
                                totalCount={d.todos.length}
                                selected={selectedTopicIdx === i}
                                onClick={() => setSelectedTopicIdx(selectedTopicIdx === i ? null : i)}
                              />
                            );
                          })
                      }
                    </div>

                    {/* WEEKLY BAR CHART */}
                    <div className="ip-card">
                      <div className="ip-card-title">This Week's Activity</div>
                      <WeeklyBar calendar={calendar} />
                    </div>


                  </div>

                  {/* RIGHT SIDEBAR */}
                  <div className="ip-sidebar">
                    {selectedTopic ? (
                      <div className="ip-card">
                        <div className="ip-detail-header">
                          <div className="ip-detail-dot" style={{ background: topicGradients[selectedTopicIdx % topicGradients.length][0] }} />
                          <h3>{selectedTopic.topic.name}</h3>
                        </div>
                        {selectedTopic.todos.length === 0
                          ? <p style={{ color: "#444", fontSize: "0.85rem" }}>No tasks in this topic.</p>
                          : selectedTopic.todos.map(todo => (
                              <div key={todo.id} className="ip-todo-row">
                                <button
                                  className={`ip-todo-check${todo.completed ? " checked" : ""}`}
                                  onClick={() => toggleTodo(selectedTopicIdx, todo.id, todo.completed)}
                                  title={todo.completed ? "Mark as incomplete" : "Mark as done"}
                                >
                                  {todo.completed ? "✓" : ""}
                                </button>
                                <span className={`ip-todo-label${todo.completed ? " done" : ""}`}>{todo.title}</span>
                              </div>
                            ))
                        }
                      </div>
                    ) : (
                      <div className="ip-card" style={{ textAlign: "center", padding: "40px 24px" }}>
                        <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>👆</div>
                        <p style={{ color: "#555", fontSize: "0.85rem", lineHeight: 1.6 }}>
                          Click any topic bar to see its task list here.
                        </p>
                      </div>
                    )}

                    {/* MINI TOPIC RINGS */}
                    <div className="ip-card">
                      <div className="ip-card-title">Topic-wise Progress</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
                        {topicsData.map((d, i) => {
                          const done = d.todos.filter(t => t.completed).length;
                          const pct = d.todos.length === 0 ? 0 : Math.round((done / d.todos.length) * 100);
                          const [c1] = topicGradients[i % topicGradients.length];
                          return (
                            <div key={d.topic.id} style={{ textAlign: "center", cursor: "pointer" }} onClick={() => setSelectedTopicIdx(i)}>
                              <div style={{ position: "relative", width: 60, height: 60 }}>
                                <svg width={60} height={60} viewBox="0 0 60 60" style={{ transform: "rotate(-90deg)" }}>
                                  <circle cx={30} cy={30} r={24} fill="none" stroke="#1A1A24" strokeWidth={6} />
                                  <circle
                                    cx={30} cy={30} r={24} fill="none"
                                    stroke={c1} strokeWidth={6}
                                    strokeDasharray={`${(pct / 100) * 2 * Math.PI * 24} ${2 * Math.PI * 24}`}
                                    strokeLinecap="round"
                                    style={{ transition: "stroke-dasharray 0.7s ease" }}
                                  />
                                </svg>
                                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <span style={{ fontFamily: "Syne, sans-serif", fontSize: "0.7rem", fontWeight: 700, color: c1 }}>{pct}%</span>
                                </div>
                              </div>
                              <div style={{ fontSize: "0.62rem", color: "#555", marginTop: 4, maxWidth: 60, wordBreak: "break-word", lineHeight: 1.3 }}>
                                {d.topic.name.length > 10 ? d.topic.name.slice(0, 9) + "…" : d.topic.name}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!selectedRole && (
            <div className="ip-empty">
              <span className="big">🎯</span>
              <p>Pick a role above to see your progress dashboard.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}