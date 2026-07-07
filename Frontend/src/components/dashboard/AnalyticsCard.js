import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";
import { MdAnalytics } from "react-icons/md";
import "../../styles/DashboardCards.css";

const AnalyticsCard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <motion.div
      className="dashboard-card analytics-card-nav"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="card-header">
        <h3>{t("dashboard.analytics") || "Farm Analytics"}</h3>
        <MdAnalytics size={24} className="card-icon" />
      </div>

      <div className="card-body-nav">
        <p className="card-description">
          Monitor your agricultural KPIs, visualize monthly scans, track crop yields, and view historical crop distribution charts.
        </p>
        <div className="nav-action-wrapper">
          <button
            className="action-btn-nav"
            onClick={() => navigate("/analytics")}
          >
            📊 View Analytics
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsCard;
