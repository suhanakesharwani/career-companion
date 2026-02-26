// src/components/Auth/Register/Register.jsx
import "./Register.css";
import { useState } from "react";
import { register } from "../../../services/auth";
import { useNavigate } from "react-router-dom";


export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
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
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>Create Account</h2>

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

          <button type="submit">Register</button>

          <button
            type="button"
            className="secondary-btn"
            onClick={() => navigate("/login")}
          >
            Login instead
          </button>
        </form>

        {msg && <p className="msg">{msg}</p>}
      </div>
    </div>
  );
}