import React, { useEffect, useRef, useState } from "react";
import { connectSocket, getSocket } from "../../utils/socket";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";

let recognition = null;

/* ─── Sub-components ─────────────────────────────────────── */

const StatusPill = ({ connected }) => (
  <div className={`status-pill ${connected ? "status-pill--online" : "status-pill--offline"}`}>
    <span className="status-pill__dot" />
    {connected ? "Connected" : "Disconnected"}
  </div>
);

const ScoreCard = ({ label, score, description }) => (
  <div className="score-card">
    <div className="score-card__header">
      <span className="score-card__label">{label}</span>
      <span className="score-card__value">{score}<span className="score-card__denom">/10</span></span>
    </div>
    <div className="score-card__track">
      <div className="score-card__fill" style={{ width: `${score * 10}%` }} />
    </div>
    {description && <p className="score-card__desc">{description}</p>}
  </div>
);

const EmptyMetrics = () => (
  <div className="empty-metrics">
    <div className="empty-metrics__icon">◎</div>
    <p className="empty-metrics__text">Performance metrics will appear here after you submit your first answer.</p>
  </div>
);

/* ─── Feedback renderer ──────────────────────────────────── */

const renderFeedback = (text) => {
  if (!text) return <EmptyMetrics />;
  const lines = text.split("\n").filter((l) => l.trim() !== "");
  const cards = [];
  const footers = [];

  lines.forEach((line, i) => {
    const isScore = line.includes(":") && line.includes("/10");
    if (isScore) {
      const [label, details] = line.split(":");
      const scoreMatch = details.match(/(\d+)\/10/);
      const scoreValue = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
      const description = details.split("-")[1]?.trim() || "";
      cards.push(<ScoreCard key={i} label={label.trim()} score={scoreValue} description={description} />);
    } else {
      footers.push(
        <p key={i} className="overall-feedback">
          {line.replace("OVERALL FEEDBACK:", "").trim()}
        </p>
      );
    }
  });

  return (
    <div className="feedback-scroll">
      {cards}
      {footers.length > 0 && (
        <div className="overall-feedback-card">
          <p className="overall-feedback-card__eyebrow">Overall Feedback</p>
          {footers}
        </div>
      )}
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────── */

const AiInterview = () => {
  const [question, setQuestion] = useState("");
  const [feedback, setFeedback] = useState("");
  const [role, setRole] = useState("Frontend Developer");
  const [level, setLevel] = useState("Beginner");
  const [connected, setConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");

  const transcriptRef = useRef("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);


  //suhana kesharwani MAIT
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (!recognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
    }
    recognition.onspeechend = () => {
      
    };
    recognition.onresult = (event) => {
        let finalText = transcriptRef.current;  // keep what was already confirmed
        let interimText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {  // start from new results only
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript + " ";  // commit final results
          } else {
            interimText += transcript;      // show interim results live
          }
        }

        transcriptRef.current = finalText;
        setUserAnswer(finalText + interimText);  // display both
      };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    connectSocket(
      () => {setConnected(true);
      setLoading(false);
      },
      (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "question") {
          setLoading(false);
          setQuestion(DOMPurify.sanitize(data.question));
          speak(data.question);
        }
        if (data.type === "feedback") {
          setFeedback(DOMPurify.sanitize(data.feedback));
          if (data.next_question) {
            setTimeout(() => {
              setQuestion(DOMPurify.sanitize(data.next_question));
              speak(data.next_question);
            }, 4000);
          }
        }
      },
      () => setConnected(false),
      (err) => console.error(err)
    );
  }, []);

  useEffect(() => {
    return () => {
      if (recognition) recognition.stop();
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = (text) => {
    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.onstart = () => setIsAiSpeaking(true);

    speech.onend = () => setIsAiSpeaking(false);

    speech.onerror = () => setIsAiSpeaking(false);

    window.speechSynthesis.speak(speech);

    // failsafe
    setTimeout(() => setIsAiSpeaking(false), 15000);
  };

  const startInterview = () => {
    if (!connected) { alert("Not connected to server"); return; }
    const socket = getSocket();
    if (connected && socket) {
      setFeedback(""); setUserAnswer(""); transcriptRef.current = "";
      socket.send(JSON.stringify({ type: "start", role, level }));
    }
  };

  const handleStartRecording = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    transcriptRef.current = "";
    setUserAnswer("");

    recognition.onresult = (event) => {
      let finalText = transcriptRef.current;
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript + " ";
        } else {
          interimText += transcript;
        }
      }

      transcriptRef.current = finalText;
      setUserAnswer(finalText + interimText);
    };

    recognition.onerror = (e) => {
      console.error("Speech error:", e);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
    setIsListening(true);
  };

  const handleStopAndSubmit = () => {
    if (!connected || !recognition) return;
    recognition.stop(); setIsListening(false);
    const finalAnswer = transcriptRef.current.trim();
    if (finalAnswer.length > 1000) { alert("Too Long"); return; }
    const socket = getSocket();
    if (socket && connected && finalAnswer.length > 0) {
      socket.send(JSON.stringify({ type: "answer", answer: finalAnswer, question }));
    }
  };
  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="dashboard-loader">
          <div className="loader-ring"></div>
          <p>Initializing AI Interview...</p>
        </div>
      </>
    );
  }
  return (
    <>
      <style>{CSS}</style>
      <div className="dashboard">

        {/* ── Top Nav ── */}
        <header className="topnav">
          <div className="topnav__brand">
            <span className="topnav__logo">◈</span>
            <span className="topnav__name">Career Companion</span>
          </div>
          <StatusPill connected={connected} />
        </header>

        {/* ── Body ── */}
        <div className="body-grid">

          {/* ── Left Column ── */}
          <main className="main-col">

            {/* Page title */}
            <section className="page-title">
              <p className="page-title__eyebrow">AI Interview Coach</p>
              <h1 className="page-title__heading">Practice <em>Intelligence.</em></h1>
              <p className="page-title__sub">Sharpen your answers with real-time AI feedback.</p>
            </section>

            {/* Config card */}
            <section className="card" aria-label="Interview configuration">
              <p className="card__label">Configure Session</p>
              <div className="config-row">
                <div className="field-group">
                  <label className="field-group__label" htmlFor="role-input">Role</label>
                  <input
                    id="role-input"
                    className="field-input"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Frontend Developer"
                  />
                </div>
                <div className="field-group field-group--narrow">
                  <label className="field-group__label" htmlFor="level-select">Level</label>
                  <select
                    id="level-select"
                    className="field-input"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Senior</option>
                  </select>
                </div>
                <button className="btn btn--primary config-btn" onClick={startInterview}>
                  Start Interview
                </button>
              </div>
            </section>

            {/* Question card */}
            <section className="card card--question" aria-label="Current interview question">
              <div className="card__top-row">
                <p className="card__label">Current Question</p>
                {isAiSpeaking && (
                  <div className="speaking-badge">
                    <span className="speaking-badge__dot" />
                    AI Speaking
                  </div>
                )}
              </div>

              <div className="question-body">
                {question
                  ? <p className="question-text">{question}</p>
                  : <p className="question-placeholder">Configure your role above and press <strong>Start Interview</strong> to begin.</p>
                }
              </div>

              {isListening && (
                <div className="transcript-box" aria-live="polite">
                  <span className="transcript-box__icon">🎙</span>
                  <span className="transcript-box__text">{userAnswer || "Listening…"}</span>
                </div>
              )}

              <div className="action-row">
                <button
                  className="btn btn--primary action-btn"
                  onClick={handleStartRecording}
                  disabled={isListening || isAiSpeaking || !question}
                  aria-label="Begin recording your answer"
                >
                  {isListening ? "Recording…" : "🎤 Begin Answer"}
                </button>
                <button
                  className="btn btn--danger action-btn"
                  onClick={handleStopAndSubmit}
                  disabled={!isListening}
                  aria-label="Stop recording and submit answer"
                >
                  ✓ Submit
                </button>
              </div>
            </section>

          </main>

          {/* ── Right Sidebar ── */}
          <aside className="sidebar" aria-label="Performance metrics">
            <div className="sidebar__header">
              <p className="sidebar__title">Performance Metrics</p>
              <p className="sidebar__sub">Scores update after each answer</p>
            </div>
            <div className="sidebar__body">
              {renderFeedback(feedback)}
            </div>
          </aside>

        </div>
      </div>
    </>
  );
};

/* ─── Styles ─────────────────────────────────────────────── */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&display=swap');

/* ── Tokens ── */
:root {
  --bg:        #08080E;
  --surface:   #0F0F18;
  --surface-2: #161622;
  --border:    #1D1D2A;
  --border-2:  #252535;
  --accent:    #C8FF57;
  --accent-dim: rgba(200,255,87,.07);
  --accent-glow: rgba(200,255,87,.25);
  --danger:    #FF4D4D;
  --danger-dim: rgba(255,77,77,.08);
  --text:      #EDEAE0;
  --text-2:    #888890;
  --text-3:    #44444F;
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  --font-sans: 'DM Sans', sans-serif;
  --font-display: 'Syne', sans-serif;
  --shadow-card: 0 1px 3px rgba(0,0,0,.5), 0 8px 32px rgba(0,0,0,.25);
}

/* ── Reset ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Root shell ── */
.dashboard {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  display: flex;
  flex-direction: column;
  background-image:
    radial-gradient(ellipse 80% 50% at 20% 0%, rgba(200,255,87,.04) 0%, transparent 60%),
    linear-gradient(rgba(255,255,255,.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.015) 1px, transparent 1px);
  background-size: auto, 48px 48px, 48px 48px;
}

/* ── Top Nav ── */
.topnav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 60px;
  border-bottom: 1px solid var(--border);
  background: rgba(8,8,14,.8);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 100;
}
.topnav__brand { display: flex; align-items: center; gap: 10px; }
.topnav__logo { font-size: 1.2rem; color: var(--accent); line-height: 1; }
.topnav__name { font-family: var(--font-display); font-size: 0.9rem; font-weight: 700; letter-spacing: 0.02em; color: var(--text); }

/* ── Status Pill ── */
.status-pill {
  display: flex; align-items: center; gap: 7px;
  padding: 5px 12px; border-radius: 100px;
  font-size: 0.72rem; font-weight: 600; letter-spacing: 0.04em;
  border: 1px solid var(--border-2);
}
.status-pill--online  { color: var(--accent); background: var(--accent-dim); border-color: rgba(200,255,87,.2); }
.status-pill--offline { color: var(--text-2); background: var(--surface); }
.status-pill__dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: currentColor;
}
.status-pill--online .status-pill__dot { box-shadow: 0 0 6px var(--accent); animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

/* ── Body Grid ── */
.body-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 0;
  flex: 1;
}

/* ── Main Column ── */
.main-col {
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  border-right: 1px solid var(--border);
  overflow-y: auto;
}

/* ── Page Title ── */
.page-title { margin-bottom: 8px; }
.page-title__eyebrow {
  font-size: 0.68rem; font-weight: 700;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--accent); margin-bottom: 10px;
  display: flex; align-items: center; gap: 8px;
}
.page-title__eyebrow::before { content:''; width:16px; height:1px; background:var(--accent); }
.page-title__heading {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800; letter-spacing: -0.03em; line-height: 1.05;
  margin-bottom: 10px;
}
.page-title__heading em { color: var(--text-2); font-style: italic; font-weight: 400; }
.page-title__sub { font-size: 0.9rem; color: var(--text-2); line-height: 1.5; }

/* ── Card ── */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 28px;
  box-shadow: var(--shadow-card);
}
.card--question { display: flex; flex-direction: column; gap: 20px; }
.card__label {
  font-size: 0.65rem; font-weight: 800;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--text-3);
}
.card__top-row { display: flex; align-items: center; justify-content: space-between; }

/* ── Config Row ── */
.config-row {
  display: flex; gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
  margin-top: 16px;
}
.field-group { display: flex; flex-direction: column; gap: 6px; flex: 2; min-width: 160px; }
.field-group--narrow { flex: 1; min-width: 120px; }
.field-group__label { font-size: 0.72rem; font-weight: 600; color: var(--text-2); letter-spacing: 0.04em; }
.field-input {
  width: 100%; padding: 11px 14px;
  border-radius: var(--radius-sm); border: 1px solid var(--border-2);
  background: var(--bg); color: var(--text);
  font-family: var(--font-sans); font-size: 0.9rem;
  outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  appearance: none;
}
.field-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-dim);
}
.field-input::placeholder { color: var(--text-3); }

.config-btn { align-self: flex-end; white-space: nowrap; }

/* ── Question ── */
.question-body { min-height: 90px; display: flex; align-items: flex-start; }
.question-text {
  font-family: var(--font-display);
  font-size: clamp(1.1rem, 2.5vw, 1.5rem);
  font-weight: 700; line-height: 1.35;
  color: var(--text);
}
.question-placeholder { font-size: 0.9rem; color: var(--text-3); line-height: 1.6; }
.question-placeholder strong { color: var(--text-2); }

/* ── Speaking Badge ── */
.speaking-badge {
  display: flex; align-items: center; gap: 7px;
  font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--accent); padding: 4px 10px;
  border: 1px solid rgba(200,255,87,.25); border-radius: 100px;
  background: var(--accent-dim);
}
.speaking-badge__dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--accent);
  animation: pulse 1s infinite;
}

/* ── Transcript ── */
.transcript-box {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 14px 16px;
  background: var(--accent-dim);
  border: 1px solid rgba(200,255,87,.15);
  border-left: 3px solid var(--accent);
  border-radius: var(--radius-sm);
  max-height: 140px; overflow-y: auto;
}
.transcript-box__icon { font-size: 1rem; flex-shrink: 0; }
.transcript-box__text { font-size: 0.875rem; color: var(--accent); font-style: italic; line-height: 1.5; }

/* ── Action Row ── */
.action-row { display: flex; gap: 12px; align-items: center; }
.action-btn { flex: 1; }

/* ── Buttons ── */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 12px 22px; border-radius: 100px;
  font-family: var(--font-display); font-size: 0.82rem; font-weight: 700;
  letter-spacing: 0.02em; border: none; cursor: pointer;
  transition: transform 0.25s cubic-bezier(.23,1,.32,1), box-shadow 0.25s cubic-bezier(.23,1,.32,1), filter 0.2s;
  outline: none; white-space: nowrap;
}
.btn--primary {
  background: var(--accent); color: #08080E;
}
.btn--primary:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 0 20px var(--accent-glow), 0 8px 20px rgba(0,0,0,.3);
  filter: brightness(1.05);
}
.btn--primary:active:not(:disabled) { transform: scale(0.97); }
.btn--primary:disabled { background: var(--surface-2); color: var(--text-3); cursor: not-allowed; opacity: 0.7; }

.btn--danger {
  background: var(--danger-dim); color: var(--danger);
  border: 1px solid rgba(255,77,77,.25);
}
.btn--danger:hover:not(:disabled) {
  background: rgba(255,77,77,.14);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(255,77,77,.2);
}
.btn--danger:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Sidebar ── */
.sidebar {
  background: var(--bg);
  display: flex; flex-direction: column;
  overflow-y: auto;
}
.sidebar__header {
  padding: 28px 28px 16px;
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0;
  background: var(--bg);
  z-index: 10;
}
.sidebar__title {
  font-family: var(--font-display);
  font-size: 0.8rem; font-weight: 800;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--accent);
}
.sidebar__sub { font-size: 0.75rem; color: var(--text-3); margin-top: 4px; }
.sidebar__body { padding: 20px 24px; flex: 1; }

/* ── Empty State ── */
.empty-metrics {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 14px; height: 260px; text-align: center;
}
.empty-metrics__icon { font-size: 2rem; color: var(--text-3); }
.empty-metrics__text { font-size: 0.82rem; color: var(--text-3); line-height: 1.6; max-width: 220px; }

/* ── Score Card ── */
.score-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 18px 20px;
  margin-bottom: 12px;
}
.score-card__header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
.score-card__label { font-size: 0.62rem; font-weight: 800; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.1em; }
.score-card__value { font-family: var(--font-display); font-size: 1.3rem; font-weight: 800; color: var(--accent); }
.score-card__denom { font-size: 0.7rem; color: var(--text-3); font-weight: 400; }
.score-card__track { height: 2px; background: var(--border-2); border-radius: 2px; margin-bottom: 10px; overflow: hidden; }
.score-card__fill { height: 100%; background: var(--accent); border-radius: 2px; transition: width 0.8s cubic-bezier(.23,1,.32,1); }
.score-card__desc { font-size: 0.78rem; color: var(--text-2); line-height: 1.5; }

/* ── Overall Feedback ── */
.overall-feedback-card {
  background: var(--surface-2);
  border: 1px solid var(--border-2);
  border-radius: var(--radius-md);
  padding: 18px 20px;
  margin-top: 4px;
}
.overall-feedback-card__eyebrow { font-size: 0.62rem; font-weight: 800; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; }
.overall-feedback { font-size: 0.82rem; color: var(--text-2); line-height: 1.65; }

.feedback-scroll { display: flex; flex-direction: column; }

/* ── Responsive ── */
@media (max-width: 1024px) {
  .body-grid { grid-template-columns: 1fr; }
  .main-col { border-right: none; border-bottom: 1px solid var(--border); padding: 36px 28px; }
  .sidebar__header { position: relative; }
  .sidebar__body { padding: 20px 28px 40px; }
}
@media (max-width: 640px) {
  .topnav { padding: 0 20px; }
  .main-col { padding: 28px 20px; }
  .config-row { flex-direction: column; }
  .config-btn { width: 100%; }
  .action-row { flex-direction: column; }
  .action-btn { width: 100%; }
  .card { padding: 22px 18px; }
}

/* ── Loader ── */
.dashboard-loader {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  color: var(--text);
  gap: 18px;
  font-family: var(--font-display);
}

.loader-ring {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: 3px solid var(--border);
  border-top: 3px solid var(--accent);
  animation: spin 1s linear infinite;
  box-shadow: 0 0 20px var(--accent-glow);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
`;

export default AiInterview;