// src/components/Home/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./home.css";

export default function Home() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get("http://127.0.0.1:8000/home/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setMessage(res.data.message))
      .catch(() => navigate("/login"));
  }, [navigate]);

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <h1>Welcome to Career Companion</h1>
        <p>Your personal career workspace</p>
        {message && <p className="backend-msg">{message}</p>}
      </header>

      {/* QUICK OVERVIEW */}
      <section className="overview">
        <h2>What would you like to work on today?</h2>
        <p>
          Use Career Companion to plan your applications, improve your resume,
          and prepare for opportunities with clarity.
        </p>
      </section>

      {/* MAIN TOOLS */}
      <section className="container">
        <div className="card">
          <h3>Resume–JD Matcher</h3>
          <p>
            Upload your resume and a job description to see match percentage,
            missing skills, and improvement suggestions.
          </p>
          <button className="btn" onClick={() => navigate("/matcher")}>
            Start Matching
          </button>
        </div>

        <div className="card">
          <h3>Resume Analyzer</h3>
          <p>
            Get structured feedback on resume sections, clarity, and
            ATS-friendliness.
          </p>
          <button
            className="btn"
            onClick={() => alert("This feature is under progress!")}
          >
            Analyze Resume
          </button>
        </div>

        <div className="card">
          <h3>Job Application Tracker</h3>
          <p>
            Track applications, deadlines, statuses, and follow-ups in one
            place.
          </p>
          <button className="btn" onClick={() => navigate("/jobs")}>
            Track Applications
          </button>
        </div>

        <div className="card">
          <h3>Career Guidance</h3>
          <p>
            Explore suitable roles, required skills, and learning paths based
            on your profile.
          </p>
          <button
            className="btn"
            onClick={() => alert("This feature is under progress!")}
          >
            Get Guidance
          </button>
        </div>
      </section>

      {/* HOW IT HELPS */}
      <section className="how-help">
        <h2>How Career Companion helps you</h2>
        <ul>
          <li> Understand where your resume stands</li>
          <li> Stay organized during job applications</li>
          <li> Identify skill gaps early</li>
          <li> Make informed career decisions</li>
        </ul>
      </section>
    </>
  );
}