import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/auth/register", {
        name,
        email,
        password,
      });

      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">

        {/* Logo */}
        <span className="register-logo">🌱</span>
        <p className="register-brand">Smart Farmer</p>
        <h1 className="register-title">Join the Platform</h1>
        <p className="register-subtitle">Start your smart farming journey today</p>

        {/* Alerts */}
        {error && <div className="register-error">⚠️ {error}</div>}
        {success && <div className="register-success">✅ {success}</div>}

        {/* Form */}
        <form className="register-form" onSubmit={handleRegister}>
          <div className="register-input-wrapper">
            <span className="register-input-icon">👤</span>
            <input
              id="register-name"
              className="register-input"
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="register-input-wrapper">
            <span className="register-input-icon">📧</span>
            <input
              id="register-email"
              className="register-input"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="register-input-wrapper">
            <span className="register-input-icon">🔒</span>
            <input
              id="register-password"
              className="register-input"
              type="password"
              placeholder="Create password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button
            id="register-submit-btn"
            className="register-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account →"}
          </button>
        </form>

        <p className="register-terms">
          By registering, you agree to receive AI-powered farming insights.
        </p>

        <p className="login-link">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;