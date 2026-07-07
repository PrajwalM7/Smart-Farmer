import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";
import { MdLeakAdd } from "react-icons/md";
import "../../styles/DashboardCards.css";

const DiseaseDetectionCard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <motion.div
      className="dashboard-card disease-card-nav"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="card-header">
        <h3>{t("dashboard.disease") || "Disease Detection"}</h3>
        <MdLeakAdd size={24} className="card-icon" />
      </div>

      <div className="card-body-nav">
        <p className="card-description">
          Upload leaf images to instantly diagnose plant diseases. Supports Potato, Tomato, Rice, Maize, Wheat, Banana, Mango, and more with high accuracy.
        </p>
        <div className="nav-action-wrapper">
          <button
            className="action-btn-nav disease-btn-action"
            onClick={() => navigate("/disease")}
          >
            🌿 Diagnose Leaf
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DiseaseDetectionCard;
