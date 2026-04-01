import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/auth";

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
  .fp-root {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }
  .fp-card {
    background: var(--surface);
    padding: 40px;
    border-radius: 16px;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
  }
  .fp-card h2 {
    font-family: 'Syne', sans-serif;
    margin-bottom: 24px;
    font-weight: 800;
    font-size: 1.6rem;
    color: var(--accent);
  }
  .fp-card input {
    width: 100%;
    padding: 12px;
    margin-bottom: 16px;
    background: var(--bg);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 1rem;
  }
  .fp-btn {
    width: 100%;
    background: var(--accent);
    color: var(--bg);
    border: none;
    padding: 12px;
    border-radius: 100px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Syne', sans-serif;
    transition: transform 0.15s;
  }
  .fp-btn:hover { transform: scale(1.04); }
`;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      await API.post("forgot-password/", { email });
      alert("Email sent if user exists!");
      navigate("/login");
    } catch (err) {
      alert("Something went wrong. Try again!");
    }
  };

  return (
    <>
      <style>{style}</style>
      <div className="fp-root">
        <div className="fp-card">
          <h2>Forgot Password</h2>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="fp-btn" onClick={handleSubmit}>
            Send Reset Link
          </button>
        </div>
      </div>
    </>
  );
}