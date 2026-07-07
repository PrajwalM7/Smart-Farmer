import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";
import { FiAlertCircle } from "react-icons/fi";
import LoadingSpinner from "../LoadingSpinner";
import "../../styles/DashboardCards.css";

const PestAlertCard = ({ refreshKey = 0 }) => {
  const { t, language } = useLanguage();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlert = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/pest?temperature=28&humidity=75&language=${language}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.success === false) {
        // Fallback UI when AI service is unavailable
        setError("AI service temporarily unavailable. Please try again later.");
        setAlert(null);
        return;
      }
      
      setAlert(response.data.alert || null);
      setError(null);
    } catch (err) {
      console.error("Pest fetch error:", err);
      setError(err.response?.data?.message || err.message || "Unable to fetch pest alerts");
      setAlert(null);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchAlert();
  }, [fetchAlert, refreshKey]);

  const getSeverityColor = (level) => {
    switch (level?.toLowerCase()) {
      case "critical":
        return "#ff4757";
      case "high":
        return "#ffa502";
      case "medium":
        return "#ffd93d";
      case "low":
        return "#6bcf7f";
      default:
        return "#a4b0bd";
    }
  };

  return (
    <motion.div
      className="dashboard-card pest-card"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <div className="card-header">
        <h3>{t("dashboard.pest") || "Pest & Disease Alert"}</h3>
        <FiAlertCircle size={24} className="card-icon" />
      </div>

      {loading ? (
        <LoadingSpinner fullPage={false} message="Analyzing conditions..." />
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchAlert}>
            Retry
          </button>
        </div>
      ) : alert ? (
        <div className="pest-content">
          <div
            className="risk-level"
            style={{ borderLeftColor: getSeverityColor(alert.risk_level) }}
          >
            <span className="label">{t("pest.riskLevel") || "Risk Level"}</span>
            <span
              className="level-badge"
              style={{ backgroundColor: getSeverityColor(alert.risk_level) }}
            >
              {alert.risk_level?.toUpperCase() || "MEDIUM"}
            </span>
          </div>

          {alert.identified_pests && alert.identified_pests.length > 0 && (
            <div className="pests-list">
              <h4>{t("pest.identified") || "Identified Pests"}</h4>
              {alert.identified_pests.slice(0, 3).map((pest, idx) => (
  <div key={idx} className="pest-item">
    <span className="pest-name">
      {pest.pest_name}
    </span>

    <span className="likelihood">
      {pest.likelihood}
    </span>
  </div>
))}
            </div>
          )}

          {alert.disease_risk && (
  <div className="disease-risk">
    <span className="label">
      {t("pest.diseaseRisk") || "Disease Risk"}
    </span>

    <p>
      <strong>
        {alert.disease_risk.type}
      </strong>
    </p>

    <p>
      Likelihood: {alert.disease_risk.likelihood}
    </p>
  </div>
)}
          {alert.early_warning_signs && alert.early_warning_signs.length > 0 && (
            <div className="warning-signs">
              <h4>{t("pest.warnings") || "Early Warning Signs"}</h4>
              <ul className="signs-list">
                {alert.early_warning_signs.slice(0, 2).map((sign, idx) => (
                  <li key={idx}>{sign}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="no-data">{t("dashboard.noData") || "No data"}</p>
      )}
    </motion.div>
  );
};




export default PestAlertCard;
