import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";
import { MdSchool } from "react-icons/md";
import "../../styles/DashboardCards.css";

const GovernmentSchemesCard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <motion.div
      className="dashboard-card schemes-card-nav"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="card-header">
        <h3>{t("dashboard.schemes") || "Govt Schemes"}</h3>
        <MdSchool size={24} className="card-icon" />
      </div>

      <div className="card-body-nav">
        <p className="card-description">
          Discover central and state-level agricultural schemes, crop insurance policies, solar subsidy options, and loan incentives matching your profile.
        </p>
        <div className="nav-action-wrapper">
          <button
            className="action-btn-nav"
            onClick={() => navigate("/government-schemes")}
          >
            🏫 Find Schemes
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default GovernmentSchemesCard;
