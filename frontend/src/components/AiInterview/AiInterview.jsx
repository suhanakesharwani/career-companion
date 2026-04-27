import React, { useEffect, useRef, useState } from "react";
import { connectSocket, getSocket } from "../../utils/socket";

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
      <span className="score-card__value">
        {score}<span className="score-card__denom">/10</span>
      </span>
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
    <p className="empty-metrics__text">
      Performance metrics will appear here after your first answer.
    </p>
  </div>
);

/* ─── Feedback Renderer ─────────────────────────────────────── */

const renderFeedback = (text) => {
  if (!text) return <EmptyMetrics />;

  const lines = text.split("\n").filter(Boolean);
  const cards = [];
  const footers = [];

  lines.forEach((line, i) => {
    const isScore = line.includes(":") && line.includes("/10");

    if (isScore) {
      const [label, details] = line.split(":");
      const scoreMatch = details?.match(/(\d+)\/10/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
      const desc = details?.split("-")[1]?.trim() || "";

      cards.push(
        <ScoreCard
          key={i}
          label={label.trim()}
          score={score}
          description={desc}
        />
      );
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

  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");
  const socketRef = useRef(null);

  /* ─── SOCKET CONNECTION ─── */
  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
    };

    socket.onclose = () => {
      setConnected(false);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "question") {
          setQuestion(data.question);
          speak(data.question);
        }

        if (data.type === "feedback") {
          setFeedback(data.feedback);

          // optional: backend sends next_question
          if (data.next_question) {
            setQuestion(data.next_question);
          }
        }

      } catch (err) {
        console.log("Invalid socket message:", err);
      }
    };

    return () => socket.close();
  }, []);

  /* ─── SPEECH RECOGNITION ─── */
 /* ─── SPEECH RECOGNITION ─── */
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalText = transcriptRef.current;
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += t + " ";
        else interimText += t;
      }

      transcriptRef.current = finalText;
      setUserAnswer(finalText + interimText);
    };

    // FIX: Handling the 'no-speech' error specifically
    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        // Just log it, don't stop the UI from showing "listening"
        console.warn("Speech API: No speech detected, still listening...");
        return; 
      }
      
      console.error("Speech Error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      // If the browser stops it automatically but we didn't click "Submit"
      // we might want to restart it, or just set the state to false.
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  /* ─── SPEAK AI QUESTION ─── */
  const speak = (text) => {
    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.onstart = () => setIsAiSpeaking(true);
    speech.onend = () => setIsAiSpeaking(false);
    speech.onerror = () => setIsAiSpeaking(false);

    window.speechSynthesis.speak(speech);

    setTimeout(() => setIsAiSpeaking(false), 15000);
  };

  /* ─── START INTERVIEW ─── */
  const startInterview = () => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== 1) {
      alert("Not connected to server");
      return;
    }

    setQuestion("");
    setFeedback("");
    setUserAnswer("");
    transcriptRef.current = "";

    socket.send(
      JSON.stringify({
        type: "start",
        role,
        level,
      })
    );
  };

  /* ─── RECORD ─── */
  const handleStartRecording = () => {
    const recognition = recognitionRef.current;

    if (!recognition) return;

    if (window.speechSynthesis.speaking) {
      alert("Wait for AI to finish speaking");
      return;
    }

    transcriptRef.current = "";
    setUserAnswer("");

    recognition.start();
    setIsListening(true);
  };

  /* ─── STOP & SEND ─── */
  const handleStopAndSubmit = () => {
    const recognition = recognitionRef.current;
    const socket = socketRef.current;

    if (!recognition || !socket) return;

    recognition.stop();

    const finalAnswer = transcriptRef.current.trim();

    if (!finalAnswer) {
      alert("No answer detected");
      return;
    }

    socket.send(
      JSON.stringify({
        type: "answer",
        answer: finalAnswer,
        question: question,
      })
    );

    setIsListening(false);
  };

  /* ─── UI ─── */
  return (
    <>
      <style>{CSS}</style>

      <div className="dashboard">

        {/* TOP BAR */}
        <header className="topnav">
          <div className="topnav__brand">
            <span className="topnav__logo">◈</span>
            <span className="topnav__name">Career Companion</span>
          </div>
          <StatusPill connected={connected} />
        </header>

        <div className="body-grid">

          {/* LEFT */}
          <main className="main-col">

            <section className="page-title">
              <p className="page-title__eyebrow">AI Interview Coach</p>
              <h1 className="page-title__heading">Practice <em>Intelligence.</em></h1>
            </section>

            <section className="card">
              <p className="card__label">Configure</p>

              <div className="config-row">
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Role"
                  className="field-input"
                />

                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="field-input"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Senior</option>
                </select>

                <button className="btn btn--primary" onClick={startInterview}>
                  Start
                </button>
              </div>
            </section>

            <section className="card">
              <p className="card__label">Question</p>

              <div className="question-body">
                {question || "Start interview to begin"}
              </div>

              {isListening && (
                <div className="transcript-box">
                  {userAnswer || "Listening..."}
                </div>
              )}

              <div className="action-row">
                <button
                  className="btn btn--primary"
                  onClick={handleStartRecording}
                  disabled={isListening}
                >
                  🎤 Answer
                </button>

                <button
                  className="btn btn--danger"
                  onClick={handleStopAndSubmit}
                  disabled={!isListening}
                >
                  Submit
                </button>
              </div>
            </section>

          </main>

          {/* RIGHT */}
          <aside className="sidebar">
            <div className="sidebar__header">
              <p className="sidebar__title">Metrics</p>
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

export default AiInterview;