import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import axios from "axios";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        {/* Logo */}
        <span className="login-logo">🌾</span>
        <p className="login-brand">Smart Farmer</p>
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in to your farming dashboard</p>

        {/* Error */}
        {error && <div className="login-error">⚠️ {error}</div>}

        {/* Form */}
        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-wrapper">
            <input
              id="login-email"
              className="login-input"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <span className="input-icon" style={{ left: "0.9rem" }}>📧</span>
          </div>

          <div className="input-wrapper">
            <input
              id="login-password"
              className="login-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <span className="input-icon" style={{ left: "0.9rem" }}>🔒</span>
          </div>

          <button
            id="login-submit-btn"
            className="login-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        {/* Register link */}
        <p className="register-link">
          New to Smart Farmer?{" "}
          <Link to="/register">Create account</Link>
        </p>

        {/* Feature badges */}
        <div className="login-features">
          <span className="feature-badge"><span className="badge-icon">🌦</span> Weather</span>
          <span className="feature-badge"><span className="badge-icon">🤖</span> AI Advisor</span>
          <span className="feature-badge"><span className="badge-icon">📊</span> Analytics</span>
        </div>
      </div>
    </div>
  );
}

export default Login;