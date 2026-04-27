import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
axios.defaults.withCredentials = true;

const style = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.matcher-root {
  min-height: 100vh;
  background: #0A0A0F;
  color: #F0EEE8;
  font-family: 'DM Sans', sans-serif;
}

/* CONTAINER */
.matcher-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 20px;
}

/* HEADER */
.matcher-header h1 {
  font-family: 'Syne', sans-serif;
  font-size: 2rem;
}

.matcher-header span {
  color: #C8FF57;
}

.matcher-header p {
  margin-top: 6px;
  color: #777;
  font-size: 0.9rem;
}

/* FORM CARD */
.matcher-card {
  margin-top: 28px;
  background: #111118;
  border: 1px solid #1E1E2C;
  border-radius: 20px;
  padding: 26px;
}

/* INPUT */
.matcher-card input,
.matcher-card textarea {
  width: 100%;
  margin-top: 12px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #1E1E2C;
  background: #0A0A0F;
  color: #F0EEE8;
  font-size: 0.9rem;
  outline: none;
}

.matcher-card input:focus,
.matcher-card textarea:focus {
  border-color: #C8FF57;
}

/* BUTTON */
.matcher-btn {
  margin-top: 16px;
  background: #C8FF57;
  color: #0A0A0F;
  border: none;
  border-radius: 100px;
  padding: 10px 18px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.matcher-btn:hover {
  transform: scale(1.05);
}

/* ERROR */
.matcher-error {
  margin-top: 12px;
  font-size: 0.85rem;
  color: #ff6b6b;
}

/* RESULT CARD */
.matcher-result {
  margin-top: 28px;
  background: #111118;
  border: 1px solid #1E1E2C;
  border-radius: 20px;
  padding: 26px;
  animation: fadeUp 0.4s ease;
}

.matcher-score {
  font-family: 'Syne', sans-serif;
  font-size: 1.4rem;
  margin-bottom: 16px;
}

.matcher-score span {
  color: #C8FF57;
}

/* GRID */
.result-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.result-block h4 {
  margin-bottom: 10px;
  font-size: 0.95rem;
}

.result-block ul {
  list-style: none;
}

.result-block li {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 6px;
  padding-left: 14px;
  position: relative;
}

.result-block li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #C8FF57;
}

/* ANIMATION */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .result-grid {
    grid-template-columns: 1fr;
  }
}
`;

export default function ResumeMatcher() {
  
  const navigate = useNavigate();


  const [resume, setResume] = useState(null);
  const [jdText, setJdText] = useState("");
  const [error, setError] = useState("");

  // Change initial state to null
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      setResult(null);

      if (!resume || !jdText) {
          setError("Resume and Job Description are required");
          return;
      }

      setLoading(true);
      const formData = new FormData();
      formData.append("resume", resume);
      formData.append("jd_text", jdText);

      try {
          const res = await axios.post(
              "https://career-companion-backend-uhlf.onrender.com/matching/",
              formData,
              { withCredentials: true }
          );

          const data = res.data;

          // Safely extract with fallbacks
          const matchingResult = data?.matching_result;

          if (matchingResult) {
              setResult({
                  matched_skills: Array.isArray(matchingResult.matched_skills)
                      ? matchingResult.matched_skills
                      : [],
                  missing_skills: Array.isArray(matchingResult.missing_skills)
                      ? matchingResult.missing_skills
                      : [],
                  score: typeof matchingResult.score === "number"
                      ? matchingResult.score
                      : 0,
              });
          } else {
              setError(data?.error || "No result returned from server.");
          }

      } catch (err) {
          console.error("Analysis Error:", err);

          if (err.response?.status === 503) {
              setError("AI service is waking up — please wait 20 seconds and try again.");
          } else if (err.response?.status === 404) {
              setError("API endpoint not found. Check your backend URL.");
          } else {
              setError("Failed to analyze resume. Please try again.");
          }
      } finally {
          setLoading(false);
      }
  };
  return (
    <>
      <style>{style}</style>

      <div className="matcher-root">
        <div className="matcher-container">

          {/* HEADER */}
          <div className="matcher-header">
            <h1>
              Resume–JD <span>Matcher</span>
            </h1>
            <p>Compare your resume with job descriptions instantly</p>
          </div>

          {/* FORM */}
          <div className="matcher-card">
            <form onSubmit={handleSubmit}>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResume(e.target.files[0])}
              />

              <textarea
                rows="8"
                placeholder="Paste job description..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              />

              <button type="submit" className="matcher-btn">
                Analyze
              </button>
            </form>

            {error && <p className="matcher-error">{error}</p>}
          </div>

          {/* RESULT */}
          <button
            type="submit"
            className="matcher-btn"
            disabled={loading}
        >
            {loading ? "Analyzing..." : "Analyze"}
        </button>

        {/* Only render result card when we actually have data */}
                  {result && (
                      <div className="matcher-result">
                          <div className="matcher-score">
                              Match Score: <span>{Math.round(result.score * 100)}%</span>
                          </div>

                          <div className="result-grid">
                              <div className="result-block">
                                  <h4>Matched Skills</h4>
                                  <ul>
                                      {result.matched_skills.length > 0
                                          ? result.matched_skills.map((skill, i) => (
                                              <li key={i}>{skill}</li>
                                            ))
                                          : <li>No skills matched</li>
                                      }
                                  </ul>
                              </div>

                              <div className="result-block">
                                  <h4>Missing Skills</h4>
                                  <ul>
                                      {result.missing_skills.length > 0
                                          ? result.missing_skills.map((s, i) => (
                                              <li key={i}>{s}</li>
                                            ))
                                          : <li>No missing skills identified</li>
                                      }
                                  </ul>
                              </div>
                          </div>
                      </div>
                  )}

        </div>
      </div>
    </>
  );
}