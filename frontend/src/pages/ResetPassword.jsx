import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  .rp-root {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }
  .rp-card {
    background: var(--surface);
    padding: 40px;
    border-radius: 16px;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
  }
  .rp-card h2 {
    font-family: 'Syne', sans-serif;
    margin-bottom: 24px;
    font-weight: 800;
    font-size: 1.6rem;
    color: var(--accent);
  }
  .rp-card input {
    width: 100%;
    padding: 12px;
    margin-bottom: 16px;
    background: var(--bg);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 1rem;
  }
  .rp-btn {
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
  .rp-btn:hover { transform: scale(1.04); }
`;

export default function ResetPassword() {
  const { uid, token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async () => {

    // ✅ Check password match
    if (password !== confirmPassword) {
        setMsg("Passwords do not match!");
        return;
    }

    try {
        await API.post(`reset-password/${uid}/${token}/`, {
        password,
        confirm_password: confirmPassword,
        });

        setMsg("Password reset successful!");
        setTimeout(() => navigate("/login"), 1200);

    } catch (err) {
        setMsg("Failed to reset password. Try again!");
    }
    };

  return (
    <>
      <style>{style}</style>
      <div className="rp-root">
        <div className="rp-card">
          <h2>Reset Password</h2>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            />
          <button className="rp-btn" onClick={handleSubmit}>
            Reset Password
          </button>
        </div>
      </div>
    </>
  );
}