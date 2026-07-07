import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";
import { MdEnergySavingsLeaf } from "react-icons/md";
import { FiUser, FiArrowRight } from "react-icons/fi";
import LoadingSpinner from "../LoadingSpinner";
import "../../styles/DashboardCards.css";
import { ObjectRenderer } from "../common/ObjectRenderer";
const ProfilePrompt = ({ message }) => {
  const navigate = useNavigate();
  return (
    <div className="card-profile-prompt">
      <span className="prompt-icon">🧪</span>
      <p>{message || "Complete your profile to get personalized fertilizer advice."}</p>
      <button className="prompt-btn" onClick={() => navigate("/profile")}>
        <FiUser size={14} /> Set Up Profile <FiArrowRight size={14} />
      </button>
    </div>
  );
};

const FertilizerAdviceCard = ({ refreshKey = 0 }) => {
  const { t, language } = useLanguage();
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdvice = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/fertilizer?language=${language}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Fallback UI when AI service is unavailable
      if (response.data && response.data.success === false) {
        setError("AI service temporarily unavailable. Please try again later.");
        setAdvice(null);
        return;
      }
      setAdvice(response.data.advisory);
      setError(null);
    } catch (err) {
      console.error("Fertilizer fetch error:", err);
      const status = err?.response?.status;
      if (status === 401 || status === 404) {
        setAdvice(null);
        setError(null);
      } else {
        setError("Unable to fetch fertilizer advice. Please try again.");
      }
      setAdvice(null);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchAdvice();
  }, [fetchAdvice, refreshKey]);

  return (
    <motion.div
      className="dashboard-card fertilizer-card"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <div className="card-header">
        <h3>{t("dashboard.fertilizer") || "Fertilizer Suggestion"}</h3>
        <MdEnergySavingsLeaf size={24} className="card-icon" />
      </div>

      {loading ? (
        <LoadingSpinner fullPage={false} message="Loading advice..." />
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchAdvice}>
            Retry
          </button>
        </div>
      ) : advice ? (
        <div className="fertilizer-content">
          <div className="npk-ratio">
            <h4>NPK Ratio</h4>
            <div className="ratio-display">
              <div className="ratio-item">
                <span className="label">Recommended</span>
                <span className="value">{advice.npk_ratio || "--"}</span>
              </div>
            </div>
          </div>

        {advice.primary_fertilizer && (
          <div className="stat-row">
            <span className="stat-label">🌿 Fertilizer</span>
            <span className="stat-value">
              <ObjectRenderer obj={advice.primary_fertilizer} />
            </span>
          </div>
        )}
        {advice.primary_fertilizer && advice.primary_fertilizer.quantity_kg_per_acre && (
          <div className="stat-row">
            <span className="stat-label">⚖️ Quantity</span>
            <span className="stat-value">{advice.primary_fertilizer.quantity_kg_per_acre} kg/acre</span>
          </div>
        )}

          {advice.application_schedule && Object.keys(advice.application_schedule).length > 0 && (
            <div style={{ marginTop: "8px" }}>
              <strong style={{ fontSize: "13px" }}>📅 Application Schedule</strong>
              <div style={{ fontSize: "12px", marginTop: "4px", color: "var(--text-secondary, #aaa)" }}>
                {Object.entries(advice.application_schedule).slice(0, 3).map(([month, qty], i) => (
                  <div key={i}>{month}: {qty}</div>
                ))}
              </div>
            </div>
          )}

          <div className="cost" style={{ marginTop: "8px" }}>
            <span className="label">💰 Estimated Cost</span>
            <span className="value">₹{advice.total_estimated_cost || "--"}</span>
          </div>

          <div className="cost">
            <span className="label">📈 Yield Improvement</span>
            <span className="value">{advice.yield_improvement_percent || "--"}%</span>
          </div>

          {advice.micronutrients && advice.micronutrients.length > 0 && (
            <div className="micronutrients">
              <h4>Micronutrients</h4>
              <div className="micro-list">
                {advice.micronutrients.map((micro, idx) => (
                  <span key={idx} className="micro-tag">
                    {micro.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: "10px", fontSize: "13px" }}>
            <strong>💡 Tips:</strong>
            <p style={{ marginTop: "4px" }}>{advice.tips || "Apply fertilizer in split doses for best results."}</p>
          </div>
        </div>
      ) : (
        <ProfilePrompt message="Set your farm location and soil type to get AI-generated fertilizer recommendations." />
      )}
    </motion.div>
  );
};

export default FertilizerAdviceCard;
