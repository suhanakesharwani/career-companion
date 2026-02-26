import { useNavigate } from "react-router-dom";
import "./landing.css";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">Career Companion</div>
        <div className="nav-actions">
          <button onClick={() => navigate("/login")}>Login</button>
          <button className="primary" onClick={() => navigate("/register")}>
            Register
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <h1>Build a Smarter Career Path</h1>
        <p>
          Resume matching, job tracking, interview preparation, and AI-powered
          career guidance — all in one platform.
        </p>
        <button onClick={() => navigate("/register")}>
          Get Started
        </button>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="card">
          <h3>Resume–JD Matcher</h3>
          <p>Analyze skill gaps and match percentage instantly.</p>
        </div>

        <div className="card">
          <h3>Application Tracker</h3>
          <p>Track all job applications with status and deadlines.</p>
        </div>

        <div className="card">
          <h3>Interview Prep</h3>
          <p>Practice technical and HR questions confidently.</p>
        </div>

        <div className="card">
          <h3>Career Guidance</h3>
          <p>AI-powered recommendations based on your goals.</p>
        </div>
      </section>

      {/* QUESTIONS / HELP SECTION */}
      <section className="qa">
        <h2>Questions students usually ask</h2>
        <p className="qa-subtitle">
          Everything you need to know before getting started with Career Companion.
        </p>

        <div className="qa-list">
          <details className="qa-item">
            <summary>
              How does Career Companion help in career planning?
              <span className="qa-icon"></span>
            </summary>
            <p>
              Career Companion helps you analyze your resume, track job applications,
              identify skill gaps, and prepare for interviews — all in one platform.
            </p>
          </details>

          <details className="qa-item">
            <summary>
              Is Career Companion useful for students and freshers?
              <span className="qa-icon"></span>
            </summary>
            <p>
              Yes. It is designed especially for students, freshers, and early
              professionals who want structured career guidance and clarity.
            </p>
          </details>

          <details className="qa-item">
            <summary>
              Do I need to pay to use the platform?
              <span className="qa-icon"></span>
            </summary>
            <p>
              You can start for free. Core features are available without any payment,
              and premium tools can be unlocked later if needed.
            </p>
          </details>

          <details className="qa-item">
            <summary>
              Is my resume and data safe?
              <span className="qa-icon"></span>
            </summary>
            <p>
              Yes. Your data is securely stored and never shared with recruiters or
              third parties without your consent.
            </p>
          </details>

          <details className="qa-item">
            <summary>
              Can this help me switch careers?
              <span className="qa-icon"></span>
            </summary>
            <p>
              Absolutely. Career Companion suggests alternative roles, learning paths,
              and skills required to transition into a new career direction.
            </p>
          </details>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
       {"\u00A9"} 2026 Career Companion
      </footer> 
    </div>
  );
}
