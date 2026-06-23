import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { motion } from "framer-motion";
import WeatherCard from "../components/dashboard/WeatherCard";
import MandiPricesCard from "../components/dashboard/MandiPricesCard";
import CropRecommendationCard from "../components/dashboard/CropRecommendationCard";
import FertilizerAdviceCard from "../components/dashboard/FertilizerAdviceCard";
import IrrigationCard from "../components/dashboard/IrrigationCard";
import PestAlertCard from "../components/dashboard/PestAlertCard";
import YieldPredictionCard from "../components/dashboard/YieldPredictionCard";
import ProfitEstimationCard from "../components/dashboard/ProfitEstimationCard";
import "../styles/Dashboard.css";

function Dashboard() {
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="dashboard-page">
      {/* Hero Section */}
      <motion.div
        className="dashboard-hero"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>{t("dashboard.title") || "Smart Farmer Advisory"}</h1>
        <p>
          {t("dashboard.subtitle") ||
            "Real-time AI-powered farming insights for better decisions"}
        </p>
      </motion.div>

      {/* Cards Grid */}
      <motion.div
        className="dashboard-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <WeatherCard />
        </motion.div>

        <motion.div variants={itemVariants}>
          <MandiPricesCard />
        </motion.div>

        <motion.div variants={itemVariants}>
          <CropRecommendationCard />
        </motion.div>

        <motion.div variants={itemVariants}>
          <FertilizerAdviceCard />
        </motion.div>

        <motion.div variants={itemVariants}>
          <IrrigationCard />
        </motion.div>

        <motion.div variants={itemVariants}>
          <PestAlertCard />
        </motion.div>

        <motion.div variants={itemVariants}>
          <YieldPredictionCard />
        </motion.div>

        <motion.div variants={itemVariants}>
          <ProfitEstimationCard />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Dashboard;