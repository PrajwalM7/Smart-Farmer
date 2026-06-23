import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";
import { MdEnergySavingsLeaf } from "react-icons/md";
import LoadingSpinner from "../LoadingSpinner";
import "../../styles/DashboardCards.css";

const FertilizerAdviceCard = () => {
  const { t, language } = useLanguage();

  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdvice();
  }, [language]);

  const fetchAdvice = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:5000/fertilizer?language=${language}`
      );

      console.log("Fertilizer Response:", response.data);

      setAdvice(response.data.advisory);

      setError(null);
    } catch (err) {
      console.error("Fertilizer fetch error:", err);

      setError("Unable to fetch fertilizer advice");
      setAdvice(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="dashboard-card fertilizer-card"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <div className="card-header">
        <h3>
          {t("dashboard.fertilizer") ||
            "Fertilizer Suggestion"}
        </h3>

        <MdEnergySavingsLeaf
          size={24}
          className="card-icon"
        />
      </div>

      {loading ? (
        <LoadingSpinner
          fullPage={false}
          message="Loading advice..."
        />
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>

          <button
            className="retry-btn"
            onClick={fetchAdvice}
          >
            Retry
          </button>
        </div>
      ) : advice ? (
        <div className="fertilizer-content">

          <div className="npk-ratio">
            <h4>NPK Ratio</h4>

            <div className="ratio-display">
              <div className="ratio-item">
                <span className="label">
                  Recommended
                </span>

                <span className="value">
                  {advice.npk_ratio || "--"}
                </span>
              </div>
            </div>
          </div>

          <div className="cost">
            <span className="label">
              Estimated Cost
            </span>

            <span className="value">
              ₹
              {advice.total_estimated_cost ||
                "--"}
            </span>
          </div>

          <div className="cost">
            <span className="label">
              Yield Improvement
            </span>

            <span className="value">
              {advice.yield_improvement_percent ||
                "--"}
              %
            </span>
          </div>

          {advice.micronutrients &&
            advice.micronutrients.length > 0 && (
              <div className="micronutrients">
                <h4>Micronutrients</h4>

                <div className="micro-list">
                  {advice.micronutrients.map(
                    (micro, idx) => (
                      <span
                        key={idx}
                        className="micro-tag"
                      >
                        {micro.name}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

          <div
            style={{
              marginTop: "10px",
              fontSize: "14px",
            }}
          >
            <strong>Tips:</strong>

            <p>
              {advice.tips ||
                "No tips available"}
            </p>
          </div>
        </div>
      ) : (
        <p className="no-data">
          No Data Available
        </p>
      )}
    </motion.div>
  );
};

export default FertilizerAdviceCard;