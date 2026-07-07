import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";
import { FiDollarSign, FiUser, FiArrowRight } from "react-icons/fi";
import LoadingSpinner from "../LoadingSpinner";
import "../../styles/DashboardCards.css";

const ProfilePrompt = ({ message }) => {
  const navigate = useNavigate();
  return (
    <div className="card-profile-prompt">
      <span className="prompt-icon">💰</span>
      <p>{message || "Complete your profile to get profit estimations."}</p>
      <button className="prompt-btn" onClick={() => navigate("/profile")}>
        <FiUser size={14} /> Set Up Profile <FiArrowRight size={14} />
      </button>
    </div>
  );
};

const ProfitEstimationCard = () => {
  const { t, language } = useLanguage();
  const [profit, setProfit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfit = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/profit?language=${language}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data && response.data.success === false) {
        setError(response.data.message || "AI services are temporarily unavailable.");
        setProfit(null);
      } else {
        setProfit(response.data.data);
        setError(null);
      }
    } catch (err) {
      console.error("Profit fetch error:", err);
      const status = err?.response?.status;
      if (status === 401 || status === 404) {
        setProfit(null);
        setError(null);
      } else {
        setError("Unable to fetch profit estimation. Please try again.");
      }
      setProfit(null);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchProfit();
  }, [fetchProfit]);

  const getProfitColor = (value) => {
    if (value > 0) return "#6bcf7f";
    if (value < 0) return "#ff4757";
    return "#ffa502";
  };

  return (
    <motion.div
      className="dashboard-card profit-card"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.7 }}
    >
      <div className="card-header">
        <h3>{t("dashboard.profit") || "Profit Estimation"}</h3>
        <FiDollarSign size={24} className="card-icon" />
      </div>

      {loading ? (
        <LoadingSpinner fullPage={false} message="Calculating profit..." />
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchProfit}>
            Retry
          </button>
        </div>
      ) : profit ? (
        <div className="profit-content">
          <div className="profit-summary">
            <div className="summary-item">
              <span className="label">{t("profit.investment") || "Total Cost"}</span>
              <span className="value">
                ₹{profit.total_investment || "--"}
              </span>
            </div>
            <div className="summary-item">
              <span className="label">{t("profit.revenue") || "Expected Income"}</span>
              <span className="value revenue">
                ₹{profit.total_revenue || "--"}
              </span>
            </div>
          </div>

          <div
            className="net-profit"
            style={{
              borderLeftColor: getProfitColor(profit.net_profit),
            }}
          >
            <span className="label">{t("profit.netProfit") || "Net Profit"}</span>
            <span
              className="amount"
              style={{
                color: getProfitColor(profit.net_profit),
              }}
            >
              ₹{profit.net_profit || "--"}
            </span>
          </div>

          <div className="profit-metrics">
            {profit.profit_margin_percent && (
              <div className="metric">
                <span className="label">
                  {t("profit.margin") || "Profit Margin"}
                </span>
                <span className="value">
                  {profit.profit_margin_percent || "--"}%
                </span>
              </div>
            )}
            {profit.roi_percent && (
              <div className="metric">
                <span className="label">ROI</span>
                <span className="value">{profit.roi_percent || "--"}%</span>
              </div>
            )}
          </div>

          {profit.break_even_point_kg && (
            <div className="break-even">
              <span className="label">
                {t("profit.breakEven") || "Break Even Point"}
              </span>
              <span className="value">
                {profit.break_even_point_kg} kg
              </span>
            </div>
          )}

          {profit.improvement_suggestions &&
            profit.improvement_suggestions.length > 0 && (
              <div className="suggestions">
                <h4>{t("profit.suggestions") || "Suggestions"}</h4>
                <ul className="suggestions-list">
                  {profit.improvement_suggestions.slice(0, 2).map((sugg, idx) => (
                    <li key={idx}>{sugg}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      ) : (
        <ProfilePrompt message="Add your farm details to get AI-powered profit and ROI estimations." />
      )}
    </motion.div>
  );
};

export default ProfitEstimationCard;

