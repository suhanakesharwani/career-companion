// src/components/matching/ResumeMatcher.jsx
import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ResumeMatcher.css";

export default function ResumeMatcher() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const [resume, setResume] = useState(null);
  const [jdText, setJdText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resume || !jdText) {
      setError("Resume and Job Description are required");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("jd_text", jdText);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://127.0.0.1:8000/matching/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setResult(res.data.matching_result);
      setError("");
    } catch (err) {
      setError("Failed to analyze resume");
    }
  };

  return (
    <div className="matcher-container">
      <h1>Resume–Job Matcher</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setResume(e.target.files[0])}
        />

        <textarea
          rows="10"
          placeholder="Paste job description..."
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
        />

        <button type="submit">Analyze</button>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result">
          <h3>Score: {Math.round(result.score * 100)}%</h3>

          <h4>Matched Skills</h4>
          <ul>
            {result.matched_skills.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>

          <h4>Missing Skills</h4>
          <ul>
            {result.missing_skills.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}