import { useNavigate } from "react-router-dom";

const style = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0A0A0F;
    --surface: #111118;
    --border: #1E1E2C;
    --accent: #C8FF57;
    --text: #F0EEE8;
    --muted: #555;
  }

  .nf-root {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  /* subtle grid like home */
  .nf-root::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }

  .nf-card {
    background: var(--surface);
    border: 1px solid var(--border);
    padding: 50px 40px;
    border-radius: 20px;
    text-align: center;
    max-width: 420px;
    width: 90%;
    z-index: 1;
    animation: fadeUp 0.5s ease both;
  }

  .nf-code {
    font-family: 'Syne', sans-serif;
    font-size: 5rem;
    font-weight: 800;
    color: var(--accent);
    line-height: 1;
    margin-bottom: 10px;
  }

  .nf-title {
    font-size: 1.2rem;
    color: var(--text);
    margin-bottom: 10px;
  }

  .nf-desc {
    font-size: 0.9rem;
    color: var(--muted);
    margin-bottom: 24px;
  }

  .nf-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--accent);
    color: var(--bg);
    border: none;
    padding: 10px 20px;
    border-radius: 100px;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
  }

  .nf-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(200,255,87,0.3);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      <style>{style}</style>
      <div className="nf-root">
        <div className="nf-card">
          <div className="nf-code">404</div>
          <div className="nf-title">Page Not Found</div>
          <div className="nf-desc">
            The page you're looking for doesn’t exist or was moved.
          </div>

          <button className="nf-btn" onClick={() => navigate("/")}>
            Go Home →
          </button>
        </div>
      </div>
    </>
  );
}