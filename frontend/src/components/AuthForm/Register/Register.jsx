import { useState } from "react";
import { register } from "../../../services/auth";
import { useNavigate } from "react-router-dom";

const style = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.register-root {
  min-height: 100vh;
  background: #0A0A0F;
  color: #F0EEE8;
  font-family: 'DM Sans', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* CONTAINER */
.register-box {
  width: 100%;
  max-width: 420px;
  background: #111118;
  border: 1px solid #1E1E2C;
  border-radius: 24px;
  padding: 36px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.4);
  animation: fadeUp 0.4s ease;
}

/* TITLE */
.register-box h2 {
  font-family: 'Syne', sans-serif;
  font-size: 1.8rem;
  margin-bottom: 6px;
}

.register-box span {
  color: #C8FF57;
}

.register-sub {
  font-size: 0.9rem;
  color: #777;
  margin-bottom: 22px;
}

/* INPUTS */
.register-box input {
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

.register-box input:focus {
  border-color: #C8FF57;
}

/* BUTTONS */
.register-btn {
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

.register-btn:hover {
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
.register-msg {
  margin-top: 14px;
  font-size: 0.85rem;
  color: #C8FF57;
}

/* ANIMATION */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword:""
  });

;
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setMsg("Passwords do not match!");
      return;
    }

    setLoading(true);
    setMsg("");

    try {


      await register(form.username, form.email, form.password);
      setMsg("Registered successfully!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const data = err.response?.data;

      if (data) {
        const firstKey = Object.keys(data)[0];
        setMsg(data[firstKey][0]);
      } else {
        setMsg("Server not reachable.");
      }
    }
    finally{
      setLoading(false);
    }
  };

  return (
    <>
      <style>{style}</style>

      <div className="register-root">
        <div className="register-box">
          <h2>
            Create <span>Account</span>
          </h2>
          <p className="register-sub">
            Start your AI-powered career journey
          </p>

          <form onSubmit={handleSubmit} autoComplete="off">
            <input
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />


            <button type="submit" className="register-btn" disabled={loading}>
              Register
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate("/login")}
            >
              Login instead
            </button>
          </form>

          {msg && <p className="register-msg">{msg}</p>}
        </div>
      </div>
    </>
  );
}