import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";
import { FiDroplet, FiUser, FiArrowRight } from "react-icons/fi";
import LoadingSpinner from "../LoadingSpinner";
import "../../styles/DashboardCards.css";

const ProfilePrompt = ({ message }) => {
  const navigate = useNavigate();
  return (
    <div className="card-profile-prompt">
      <span className="prompt-icon">💧</span>
      <p>{message || "Complete your profile to get personalized irrigation advice."}</p>
      <button className="prompt-btn" onClick={() => navigate("/profile")}>
        <FiUser size={14} /> Set Up Profile <FiArrowRight size={14} />
      </button>
    </div>
  );
};

const IrrigationCard = ({ refreshKey = 0 }) => {
  const { t, language } = useLanguage();
  const [irrigation, setIrrigation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIrrigation = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/irrigation?language=${language}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data && response.data.success === false) {
        setError(response.data.message || "AI services are temporarily unavailable.");
        setIrrigation(null);
      } else {
        setIrrigation(response.data.advisory);
        setError(null);
      }
    } catch (err) {
      console.error("Irrigation fetch error:", err);
      const status = err?.response?.status;
      if (status === 401 || status === 404) {
        // Not logged in or no profile — show profile prompt, not error
        setIrrigation(null);
        setError(null);
      } else {
        setError("Unable to fetch irrigation advice. Please try again.");
      }
      setIrrigation(null);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchIrrigation();
  }, [fetchIrrigation, refreshKey]);

  return (
    <motion.div
      className="dashboard-card irrigation-card"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <div className="card-header">
        <h3>{t("dashboard.irrigation") || "Irrigation Advisory"}</h3>
        <FiDroplet size={24} className="card-icon" />
      </div>

      {loading ? (
        <LoadingSpinner fullPage={false} message="Loading..." />
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchIrrigation}>
            Retry
          </button>
        </div>
      ) : irrigation ? (
        <div className="irrigation-content" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div className="stat-row">
            <span className="stat-label">💧 Daily Water Need</span>
            <span className="stat-value">{irrigation.daily_water_requirement_mm || "--"} mm</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">🪣 Per Acre</span>
            <span className="stat-value">{irrigation.daily_water_requirement_liters_per_acre || "--"} L</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">📅 Frequency</span>
            <span className="stat-value">Every {irrigation.irrigation_frequency_days || "--"} days</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">⚙️ Method</span>
            <span className="stat-value">{irrigation.best_method || "--"}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">⏰ Best Time</span>
            <span className="stat-value">{irrigation.irrigation_timing || "--"}</span>
          </div>
        </div>
      ) : (
        <ProfilePrompt message="Set your crop, soil type, and location to get AI-generated irrigation schedules." />
      )}
    </motion.div>
  );
};

export default IrrigationCard;
