import React, { useEffect, useRef, useState } from "react";
import { connectSocket, getSocket } from "../../utils/socket";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";

let recognition = null;

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

  const renderFormattedFeedback = (text) => {
    if (!text) return <div className="ai-empty-state">Waiting for your first response...</div>;
    const lines = text.split('\n').filter(line => line.trim() !== "");
    
    return (
      <div className="ai-feedback-scroll">
        {lines.map((line, index) => {
          const isScoreLine = line.includes(":") && line.includes("/10");
          if (isScoreLine) {
            const [label, details] = line.split(":");
            const scoreMatch = details.match(/(\d+)\/10/);
            const scoreValue = scoreMatch ? scoreMatch[1] : "0";
            return (
              <div key={index} className="ai-score-card">
                <div className="ai-score-header">
                  <span className="ai-score-label">{label.trim()}</span>
                  <span className="ai-score-value">{scoreValue}/10</span>
                </div>
                <div className="ai-score-bar"><div className="ai-score-fill" style={{ width: `${scoreValue * 10}%` }}></div></div>
                <p className="ai-score-desc">{details.split("-")[1] || ""}</p>
              </div>
            );
          }
          return <div key={index} className="ai-feedback-footer">{line.replace("OVERALL FEEDBACK:", "").trim()}</div>;
        })}
      </div>
    );
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (!recognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
    }
    recognition.onresult = (event) => {
      let fullText = "";
      for (let i = 0; i < event.results.length; i++) { fullText += event.results[i][0].transcript; }
      setUserAnswer(fullText);
      transcriptRef.current = fullText;
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    connectSocket(
      () => setConnected(true),
      (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "question") { setQuestion(DOMPurify.sanitize(data.question)); speak(data.question); }
        if (data.type === "feedback") { 
          setFeedback(DOMPurify.sanitize(data.feedback)); 
          if (data.next_question) {
            setTimeout(() => { setQuestion(DOMPurify.sanitize(data.next_question)); speak(data.next_question); }, 4000);
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
  };

  const startInterview = () => {
    if (!connected) {
      alert("Not connected to server");
      return;
    }
    const socket = getSocket();
    if (connected && socket) {
      setFeedback(""); setUserAnswer(""); transcriptRef.current = "";
      socket.send(JSON.stringify({ type: "start", role, level }));
    }
  };

  const handleStartRecording = () => {
    
    if (!recognition || isAiSpeaking) return;
    setUserAnswer(""); transcriptRef.current = "";
    try { recognition.start(); setIsListening(true); } 
    catch (e) { recognition.stop(); setTimeout(() => { recognition.start(); setIsListening(true); }, 200); }
  };

  const handleStopAndSubmit = () => {
    if (!connected) return;
    if (!recognition) return;
    recognition.stop(); setIsListening(false);
    
    const finalAnswer = transcriptRef.current.trim();
    if (finalAnswer.length>1000){
      alert("Too Long")
      return;
    }
    const socket = getSocket();
    if (socket && connected && finalAnswer.length > 0) {
      socket.send(JSON.stringify({ type: "answer", answer: finalAnswer, question }));
    }
  };

  const style = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

    :root {
      --bg: #0A0A0F; --surface: #111118; --border: #1E1E2C;
      --accent: #C8FF57; --accent-dim: rgba(200,255,87,0.08);
      --text: #F0EEE8; --muted: #555; --faint: #222230;
    }

    /* BASE LAYOUT */
    .ai-dashboard { 
      display: grid; grid-template-columns: 1fr 400px; height: 100vh; 
      background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif;
      position: relative; overflow: hidden;
    }

    .ai-dashboard::before { 
      content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
      background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
      background-size: 50px 50px;
    }

    .ai-dashboard::after {
      content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
      opacity: 0.3;
    }

    .ai-main, .ai-sidebar { position: relative; z-index: 1; overflow-y: auto; }

    /* MAIN INTERVIEW COLUMN */
    .ai-main { padding: clamp(20px, 5vw, 60px); border-right: 1px solid var(--border); display: flex; flex-direction: column; gap: 30px; }
    .ai-hero-eyebrow { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent); display: flex; align-items: center; gap: 10px; }
    .ai-hero-eyebrow::before { content: ''; width: 20px; height: 1px; background: var(--accent); }
    .ai-header { font-family: 'Syne', sans-serif; font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
    .ai-header span { color: var(--muted); font-style: italic; font-weight: 400; }

    .ai-card { background: var(--surface); border: 1px solid var(--border); border-radius: 24px; padding: clamp(20px, 4vw, 32px); display: flex; flex-direction: column; }
    .ai-input { width: 100%; padding: 14px; border-radius: 12px; border: 1px solid var(--border); background: var(--bg); color: white; margin-bottom: 15px; outline: none; transition: border 0.3s; }
    .ai-input:focus { border-color: var(--accent); }

    .ai-btn { 
      background: #C8FF57; 
      color: #0A0A0F; 
      padding: 14px 24px; 
      border-radius: 100px; 
      font-weight: 700; 
      border: none; 
      cursor: pointer; 
      font-family: 'Syne', sans-serif; 
      font-size: 0.85rem;
      letter-spacing: 0.02em;
      /* Cubic-bezier makes the "pop" feel more organic than a linear transition */
      transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
      position: relative;
      outline: none;
    }

    .ai-btn:hover:not(:disabled) { 
      transform: scale(1.03) translateY(-2px); 
      /* Multi-layered glow using your brand color #C8FF57 */
      box-shadow: 0 0 15px rgba(200, 255, 87, 0.4), 
                  0 0 30px rgba(200, 255, 87, 0.2),
                  0 10px 20px rgba(0, 0, 0, 0.3);
      filter: brightness(1.05);
    }

    .ai-btn:active:not(:disabled) {
      transform: scale(0.98) translateY(0px);
      box-shadow: 0 0 10px rgba(200, 255, 87, 0.6);
    }

    .ai-btn:disabled { 
      background: var(--faint); 
      color: #444; 
      opacity: 0.6; 
      cursor: not-allowed; 
      box-shadow: none;
    }
    .ai-question-text { font-family: 'Syne', sans-serif; font-size: clamp(1.2rem, 3vw, 1.6rem); line-height: 1.3; font-weight: 700; margin: 15px 0; }
    .ai-live-transcript { margin-top: 15px; padding: 14px; background: var(--accent-dim); border-radius: 12px; border-left: 3px solid var(--accent); color: var(--accent); font-size: 0.9rem; font-style: italic; max-height: 150px; overflow-y: auto; }

    /* SIDEBAR ANALYSIS */
    .ai-sidebar { background: #0A0A0F; padding: clamp(20px, 4vw, 40px); display: flex; flex-direction: column; }
    .ai-sidebar-title { font-family: 'Syne', sans-serif; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); margin-bottom: 25px; }
    .ai-score-card { background: var(--surface); padding: 20px; border-radius: 18px; margin-bottom: 15px; border: 1px solid var(--border); }
    .ai-score-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
    .ai-score-label { font-size: 0.65rem; font-weight: 800; color: var(--muted); text-transform: uppercase; }
    .ai-score-value { font-family: 'Syne', sans-serif; color: var(--accent); font-weight: 800; font-size: 1.2rem; }
    .ai-score-bar { height: 2px; background: var(--faint); margin-bottom: 10px; }
    .ai-score-fill { height: 100%; background: var(--accent); transition: width 0.8s ease; }
    .ai-score-desc { font-size: 0.8rem; color: #777; line-height: 1.4; }

    /* RESPONSIVE BREAKPOINTS */
    @media (max-width: 1024px) {
      .ai-dashboard { grid-template-columns: 1fr; height: auto; overflow-y: auto; }
      .ai-main { border-right: none; border-bottom: 1px solid var(--border); padding-bottom: 40px; }
      .ai-sidebar { height: auto; min-height: 400px; }
    }

    @media (max-width: 600px) {
      .ai-header { font-size: 2rem; }
      .ai-card { padding: 20px; }
      .ai-btn-group { flex-direction: column; }
      .ai-btn { width: 100%; }
    }
  `;

  return (
    <div className="ai-dashboard">
      <style>{style}</style>
      
      <main className="ai-main">
        <div>
          <div className="ai-hero-eyebrow">Career Companion AI</div>
          <h1 className="ai-header">Practice <span>Intelligence.</span></h1>
        </div>

        <div className="ai-card">
          <label className="ai-score-label" style={{marginBottom: '8px', display: 'block'}}>Role & Level</label>
          <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
            <input 
              className="ai-input" 
              style={{flex: 2, marginBottom: 0, minWidth: '200px'}}
              value={role} 
              onChange={e => setRole(e.target.value)} 
              placeholder="e.g. Frontend Developer" 
            />
            <button className="ai-btn" onClick={startInterview} style={{flex: 1}}>Start</button>
          </div>
        </div>

        <div className="ai-card" style={{ flex: 1 }}>
          <label className="ai-score-label">Current Question</label>
          <p className="ai-question-text">{question || "Configure your role to begin."}</p>
          
          {isListening && (
            <div className="ai-live-transcript">{userAnswer || "Listening..."}</div>
          )}

          <div className="ai-btn-group" style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '30px' }}>
            <button 
              className="ai-btn" 
              onClick={handleStartRecording} 
              disabled={isListening || isAiSpeaking || !question} 
              style={{ flex: 2 }}
            >
               {isAiSpeaking ? "Interviewer Speaking..." : "🎤 Begin Answer"}
            </button>
            <button 
              className="ai-btn" 
              onClick={handleStopAndSubmit} 
              disabled={!isListening} 
              style={{ background: 'transparent', color: '#FF4747', border: '1px solid #FF4747', flex: 1 }}
            >
               Submit
            </button>
          </div>
        </div>
      </main>

      <aside className="ai-sidebar">
        <h2 className="ai-sidebar-title">Performance Metrics</h2>
        {renderFormattedFeedback(feedback)}
      </aside>
    </div>
  );
};

export default AiInterview;