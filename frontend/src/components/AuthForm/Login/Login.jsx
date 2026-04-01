import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../../services/auth";

const style = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.login-root {
  min-height: 100vh;
  background: #0A0A0F;
  color: #F0EEE8;
  font-family: 'DM Sans', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* BOX */
.login-box {
  width: 100%;
  max-width: 420px;
  background: #111118;
  border: 1px solid #1E1E2C;
  border-radius: 24px;
  padding: 36px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.4);
  animation: fadeUp 0.4s ease;
  z-index: 1;
}

/* TITLE */
.login-box h2 {
  font-family: 'Syne', sans-serif;
  font-size: 1.8rem;
  margin-bottom: 6px;
}

.login-box span {
  color: #C8FF57;
}

.login-sub {
  font-size: 0.9rem;
  color: #777;
  margin-bottom: 22px;
}

/* INPUT */
.login-box input {
  width: 100%;
  padding: 12px 14px;
  margin-bottom: 14px;
  border-radius: 12px;
  border: 1px solid #1E1E2C;
  background: #0A0A0F;
  color: #F0EEE8;
  font-size: 0.9rem;
  outline: none;
  transition: 0.2s;
}

.login-box input:focus {
  border-color: #C8FF57;
}

/* BUTTONS */
.login-btn {
  width: 100%;
  margin-top: 6px;
  background: #C8FF57;
  color: #0A0A0F;
  border: none;
  border-radius: 100px;
  padding: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.login-btn:hover {
  transform: scale(1.03);
}

.secondary-btn {
  width: 100%;
  margin-top: 10px;
  background: transparent;
  color: #888;
  border: 1px solid #1E1E2C;
  border-radius: 100px;
  padding: 10px;
  font-size: 0.85rem;
  cursor: pointer;
}

.secondary-btn:hover {
  border-color: #C8FF57;
  color: #C8FF57;
}

/* MESSAGE */
.login-msg {
  margin-top: 14px;
  font-size: 0.85rem;
  color: #C8FF57;
}

/* LOADER OVERLAY */
.loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 10, 15, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.loader {
  border: 6px solid #1E1E2C;
  border-top: 6px solid #C8FF57;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
}

/* ANIMATIONS */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: ""});
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

   

    setLoading(true);
    setMsg("");

    try {
      await login(form.email, form.password);
      setMsg("Login successful! Redirecting...");

      setTimeout(() => navigate("/home"), 100);
    } catch (err) {
      console.log(err.response);
      setMsg("Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{style}</style>

      <div className="login-root">
        <div className="login-box">
          <h2>
            Welcome <span>Back</span>
          </h2>
          <p className="login-sub">Continue your career journey</p>

          <form onSubmit={handleSubmit} autoComplete="off">
            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              autoComplete="off"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
           

            <button type="submit" className="login-btn" disabled={loading}>
              Login
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate("/register")}
            >
              Register Instead
            </button>

            <Link to="/forgot-password">Forgot Password?</Link>
          </form>

          {msg && <p className="login-msg">{msg}</p>}
        </div>

        {/* FULL PAGE LOADER */}
        {loading && (
          <div className="loader-overlay">
            <div className="loader"></div>
          </div>
        )}
      </div>
    </>
  );
}