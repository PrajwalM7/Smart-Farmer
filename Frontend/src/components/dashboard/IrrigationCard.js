import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";
import { FiDroplet } from "react-icons/fi";
import LoadingSpinner from "../LoadingSpinner";
import "../../styles/DashboardCards.css";

const IrrigationCard = () => {
  const { t, language } = useLanguage();

  const [irrigation, setIrrigation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchIrrigation();
  }, [language]);

  const fetchIrrigation = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:5000/irrigation?language=${language}`
      );

      console.log("Irrigation Response:", response.data);

      setIrrigation(response.data.advisory);

      setError(null);
    } catch (err) {
      console.error("Irrigation fetch error:", err);
      setError("Unable to fetch irrigation advice");
      setIrrigation(null);
    } finally {
      setLoading(false);
    }
  };
  console.log("Irrigation State:", irrigation);
console.log("Loading:", loading);
console.log("Error:", error);

  return (
    <motion.div
      className="dashboard-card irrigation-card"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <div className="card-header">
        <h3>
          {t("dashboard.irrigation") ||
            "Irrigation Advisory"}
        </h3>

        <FiDroplet
          size={24}
          className="card-icon"
        />
      </div>

      {loading ? (
        <LoadingSpinner
          fullPage={false}
          message="Loading..."
        />
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>

          <button
            className="retry-btn"
            onClick={fetchIrrigation}
          >
            Retry
          </button>
        </div>
      ) : irrigation ? (
  <div style={{ padding: "10px" }}>
    <h4>Daily Water Requirement</h4>
    <p>{irrigation.daily_water_requirement_mm} mm</p>

    <h4>Liters Per Acre</h4>
    <p>{irrigation.daily_water_requirement_liters_per_acre}</p>

    <h4>Frequency</h4>
    <p>{irrigation.irrigation_frequency_days} days</p>

    <h4>Method</h4>
    <p>{irrigation.best_method}</p>

    <h4>Timing</h4>
    <p>{irrigation.irrigation_timing}</p>
  </div>
) : (
        <p className="no-data">
          No Data Available
        </p>
      )}
    </motion.div>
  );
};

export default IrrigationCard;