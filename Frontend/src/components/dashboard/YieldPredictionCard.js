import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";
import { FiTrendingUp, FiUser, FiArrowRight } from "react-icons/fi";
import LoadingSpinner from "../LoadingSpinner";
import "../../styles/DashboardCards.css";

const ProfilePrompt = ({ message }) => {
  const navigate = useNavigate();
  return (
    <div className="card-profile-prompt">
      <span className="prompt-icon">📈</span>
      <p>{message || "Complete your profile to get AI-powered yield predictions."}</p>
      <button className="prompt-btn" onClick={() => navigate("/profile")}>
        <FiUser size={14} /> Set Up Profile <FiArrowRight size={14} />
      </button>
    </div>
  );
};

const YieldPredictionCard = ({ refreshKey = 0 }) => {
  const { t, language } = useLanguage();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrediction = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/yield?language=${language}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data && response.data.success === false) {
        setError(response.data.message || "AI services are temporarily unavailable.");
        setPrediction(null);
      } else {
        setPrediction(response.data.prediction);
        setError(null);
      }
    } catch (err) {
      console.error("Yield fetch error:", err);
      const status = err?.response?.status;
      if (status === 401 || status === 404) {
        setPrediction(null);
        setError(null);
      } else {
        setError("Unable to fetch yield prediction. Please try again.");
      }
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchPrediction();
  }, [fetchPrediction, refreshKey]);

  const getConfidenceColor = (score) => {
    if (score >= 80) return "#6bcf7f";
    if (score >= 60) return "#ffa502";
    return "#ff4757";
  };

  return (
    <motion.div
      className="dashboard-card yield-card"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
    >
      <div className="card-header">
        <h3>{t("dashboard.yield") || "Yield Prediction"}</h3>
        <FiTrendingUp size={24} className="card-icon" />
      </div>

      {loading ? (
        <LoadingSpinner fullPage={false} message="Predicting yield..." />
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchPrediction}>
            Retry
          </button>
        </div>
      ) : prediction ? (
        <div className="yield-content">
          <div className="yield-main">
            <div className="yield-value">
              <span className="value">
                {prediction.expected_yield_per_acre || "--"}
              </span>
              <span className="unit">kg/acre</span>
            </div>
            <div className="yield-total">
              <span className="label">{t("yield.total") || "Estimated Production"}</span>
              <span className="total">
                {prediction.total_expected_yield_quintals || "--"} quintals
              </span>
            </div>
          </div>

          <div className="confidence">
            <div className="confidence-header">
              <span className="label">{t("yield.confidence") || "Confidence"}</span>
              <span
                className="score"
                style={{
                  color: getConfidenceColor(prediction.confidence_score),
                }}
              >
                {prediction.confidence_score || "--"}%
              </span>
            </div>
            <div
              className="confidence-bar"
              style={{
                width: `${prediction.confidence_score || 0}%`,
                backgroundColor: getConfidenceColor(prediction.confidence_score),
              }}
            />
            <span className="confidence-level">
              {prediction.confidence_level || "Medium"}
            </span>
          </div>

          {prediction.yield_analysis?.positive_factors &&
 prediction.yield_analysis.positive_factors.length > 0 && (
  <div className="factors">
    <h4 className="positive">
      {t("yield.positiveFactors") || "Positive Factors"}
    </h4>

    <ul className="factors-list">
      {prediction.yield_analysis.positive_factors
        .slice(0, 2)
        .map((factor, idx) => (
          <li key={idx} className="positive">
            {factor}
          </li>
        ))}
    </ul>
  </div>
)}

          {prediction.risk_factors && prediction.risk_factors.length > 0 && (
            <div className="factors">
              <h4 className="negative">
                {t("yield.riskFactors") || "Risk Factors"}
              </h4>
              <ul className="factors-list">
                {prediction.risk_factors.slice(0, 2).map((risk, idx) => (
                  <li key={idx} className="negative">
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <ProfilePrompt message="Set your farm details (crop, soil, size) to get AI-powered yield predictions." />
      )}
    </motion.div>
  );
};

export default YieldPredictionCard;

