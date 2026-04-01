import { useState } from "react";
import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/ai-interview/",
  withCredentials: true,
});

export default function AIInterview() {
  // ---------------- STATES ----------------
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");

  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------- GENERATE QUESTION ----------------
  const startInterview = async () => {
    if (!role || !level) {
      setError("Please select role and level");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await API.post("question/", {
        role,
        level,
      });

      setQuestion(res.data.question);
      setFeedback(null);
    } catch (err) {
      setError("Failed to generate question");
      console.error(err);
    }

    setLoading(false);
  };

  // ---------------- SUBMIT ANSWER ----------------
  const submitAnswer = async () => {
    if (!answer.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await API.post("evaluate/", {
        question,
        answer,
      });

      setFeedback(res.data.feedback);
    } catch (err) {
      setError("Evaluation failed");
      console.error(err);
    }

    setLoading(false);
  };

  // ---------------- NEXT QUESTION ----------------
  const nextQuestion = () => {
    setAnswer("");
    setFeedback(null);
    setQuestion(null);
  };

  // ---------------- UI ----------------
  return (
    <div style={styles.container}>
      <h1>🤖 AI Interview Bot</h1>

      {error && <p style={styles.error}>{error}</p>}

      {/* -------- INTERVIEW SETUP -------- */}
      {!question && (
        <div style={styles.card}>
          <h2>Start Interview</h2>

          <input
            style={styles.input}
            placeholder="Role (ML Engineer, Backend...)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />

          <select
            style={styles.input}
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="">Select Level</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>

          <button style={styles.button} onClick={startInterview}>
            Start Interview
          </button>
        </div>
      )}

      {/* -------- QUESTION -------- */}
      {question && (
        <div style={styles.card}>
          <h3>Interview Question</h3>
          <p>{question}</p>
        </div>
      )}

      {/* -------- ANSWER BOX -------- */}
      {question && !feedback && (
        <div style={styles.card}>
          <textarea
            rows="6"
            style={styles.textarea}
            placeholder="Write your answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />

          <button style={styles.button} onClick={submitAnswer}>
            Submit Answer
          </button>
        </div>
      )}

      {/* -------- FEEDBACK -------- */}
      {feedback && (
        <div style={styles.card}>
          <h3>AI Feedback</h3>
          <pre style={styles.feedback}>{feedback}</pre>

          <button style={styles.button} onClick={nextQuestion}>
            Next Question
          </button>
        </div>
      )}

      {loading && <p>AI is thinking...</p>}
    </div>
  );
}

// ---------------- STYLES ----------------
const styles = {
  container: {
    maxWidth: "700px",
    margin: "auto",
    fontFamily: "sans-serif",
    padding: "20px",
  },

  card: {
    background: "#111",
    color: "white",
    padding: "20px",
    marginTop: "20px",
    borderRadius: "10px",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
  },

  textarea: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
  },

  button: {
    marginTop: "15px",
    padding: "10px 15px",
    cursor: "pointer",
  },

  feedback: {
    whiteSpace: "pre-wrap",
  },

  error: {
    color: "red",
  },
};