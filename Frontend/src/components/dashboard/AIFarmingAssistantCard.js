import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";
import { MdChatBubble } from "react-icons/md";
import "../../styles/DashboardCards.css";

const AIFarmingAssistantCard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <motion.div
      className="dashboard-card assistant-card-nav"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="card-header">
        <h3>{t("dashboard.assistant") || "AI Assistant"}</h3>
        <MdChatBubble size={24} className="card-icon" />
      </div>

      <div className="card-body-nav">
        <p className="card-description">
          Ask questions about crop diseases, pest infestations, irrigation schedules, soil health, and get immediate organic or chemical remedies.
        </p>
        <div className="nav-action-wrapper">
          <button
            className="action-btn-nav"
            onClick={() => navigate("/assistant")}
          >
            💬 Talk to AI
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AIFarmingAssistantCard;
