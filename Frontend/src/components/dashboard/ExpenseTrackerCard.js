import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";
import { MdAttachMoney } from "react-icons/md";
import "../../styles/DashboardCards.css";

const ExpenseTrackerCard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <motion.div
      className="dashboard-card expenses-card-nav"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="card-header">
        <h3>{t("dashboard.expense") || "Expense Tracker"}</h3>
        <MdAttachMoney size={24} className="card-icon" />
      </div>

      <div className="card-body-nav">
        <p className="card-description">
          Keep tabs on your seed, pesticide, fertilizer, and labor expenditures. View structured income statements and calculate farm profit.
        </p>
        <div className="nav-action-wrapper">
          <button
            className="action-btn-nav"
            onClick={() => navigate("/expense-tracker")}
          >
            💰 Manage Finances
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ExpenseTrackerCard;
