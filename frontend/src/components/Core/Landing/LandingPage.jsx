import { useNavigate } from "react-router-dom";

const style = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

.landing-root {
  background: #0A0A0F;
  color: #F0EEE8;
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
}

/* CONTAINER */
.l-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* NAVBAR */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 0;
}

.logo {
  font-family: 'Syne', sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
}

.nav-actions button {
  margin-left: 10px;
  padding: 8px 18px;
  border-radius: 100px;
  border: 1px solid #2A2A38;
  background: transparent;
  color: #F0EEE8;
  cursor: pointer;
  transition: 0.2s;
}

.nav-actions button:hover {
  border-color: #C8FF57;
}

.nav-actions .primary {
  background: #C8FF57;
  color: #0A0A0F;
  border: none;
  font-weight: 600;
}

/* HERO */
.hero {
  text-align: center;
  padding: 80px 0 60px;
}

.hero h1 {
  font-family: 'Syne', sans-serif;
  font-size: clamp(3rem, 6vw, 4.2rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.05;
}

.hero p {
  margin: 20px auto;
  max-width: 700px;
  font-size: 1.1rem;
  color: #888;
  line-height: 1.7;
}

.hero button {
  margin-top: 20px;
  padding: 12px 26px;
  border-radius: 100px;
  border: none;
  background: #C8FF57;
  color: #0A0A0F;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.hero button:hover {
  transform: scale(1.05);
}

/* FEATURES */
.features {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
  padding: 40px 0;
}

.card {
  background: #111118;
  border: 1px solid #1E1E2C;
  border-radius: 20px;
  padding: 26px;
  transition: 0.25s;
}

.card:hover {
  transform: translateY(-4px);
  border-color: #C8FF57;
}

.card h3 {
  font-family: 'Syne', sans-serif;
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.card p {
  color: #777;
  font-size: 0.95rem;
  line-height: 1.6;
}

/* QA SECTION */
.qa {
  text-align: center;
  padding: 60px 0;
}

.qa h2 {
  font-family: 'Syne', sans-serif;
  font-size: 1.8rem;
  margin-bottom: 10px;
}

.qa-subtitle {
  color: #777;
  margin-bottom: 30px;
}

.qa-list {
  max-width: 800px;
  margin: 0 auto;
  text-align: left;
}

.qa-item {
  background: #111118;
  border: 1px solid #1E1E2C;
  border-radius: 14px;
  margin-bottom: 12px;
  padding: 16px 18px;
}

.qa-item summary {
  cursor: pointer;
  font-weight: 600;
}

.qa-item p {
  margin-top: 10px;
  font-size: 0.9rem;
  color: #666;
}

/* FOOTER */
.footer {
  text-align: center;
  padding: 30px 0;
  color: #555;
  font-size: 0.85rem;
}

/* ANIMATION */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.card {
  animation: fadeUp 0.4s ease both;
}
`;

export default function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <style>{style}</style>

      <div className="landing-root">
        <div className="l-container">

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
              <h3>Ai Powered Interviews</h3>
              <p>Practice interviews and get AI-powered feedback.</p>
            </div>
          </section>

          {/* QA */}
          <section className="qa">
            <h2>Questions students usually ask</h2>
            <p className="qa-subtitle">
              Everything you need to know before getting started.
            </p>

            <div className="qa-list">
              <details className="qa-item">
                <summary>How does it help in career planning?</summary>
                <p>Analyze resume, track jobs, and prepare smartly.</p>
              </details>

              <details className="qa-item">
                <summary>Is it useful for freshers?</summary>
                <p>Yes — designed specifically for students & beginners.</p>
              </details>

              <details className="qa-item">
                <summary>Is it free?</summary>
                <p>Core features are free to use.</p>
              </details>

              <details className="qa-item">
                <summary>Is my data safe?</summary>
                <p>Your data is securely stored and never shared.</p>
              </details>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="footer">
            © 2026 Career Companion
          </footer>

        </div>
      </div>
    </>
  );
}