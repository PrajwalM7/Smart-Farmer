import { Link } from "react-router-dom";
import React, { useState } from "react";
import axios from "axios";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", res.data.token);

      alert("Login Successful");

      window.location.href = "/dashboard";
    } catch (error) {
      alert("Login Failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <div className="login-logo">🌾</div>

        <h1 className="login-title">
          Farmer Login
        </h1>

        <form onSubmit={handleLogin}>

          <input
            className="login-input"
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            className="login-input"
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            className="login-btn"
            type="submit"
          >
            Login
          </button>

        </form>

       <p className="register-link">
  Don't have an account?{" "}
  <Link to="/register">Register here</Link>
</p>
      </div>
    </div>
  );
}

export default Login;