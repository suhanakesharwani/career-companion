// src/components/Auth/Login/Login.jsx
import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../../services/auth";


export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [msg, setMsg] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.username, form.password);
      setMsg("Login successful!");
      navigate("/home");
    } catch (err) {
      console.log(err);
      setMsg("Login failed. Please enter correct credentials");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Login</h2>

        <form onSubmit={handleSubmit} autoComplete="off">
          <input
            name="username"
            placeholder="Username"
            value={form.username}
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

          <button type="submit">Login</button>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => navigate("/register")}
          >
            Register Instead
          </button>
        </form>

        {msg && <p className="msg">{msg}</p>}
      </div>
    </div>
  );
}