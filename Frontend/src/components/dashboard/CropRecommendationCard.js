import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";
import { MdAgriculture } from "react-icons/md";
import LoadingSpinner from "../LoadingSpinner";
import "../../styles/DashboardCards.css";

const CropRecommendationCard = () => {
  const { t, language } = useLanguage();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, [language]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/crop?language=${language}`
      );
      setRecommendations(response.data.recommendations || []);
      setError(null);
    } catch (err) {
      console.error("Crop fetch error:", err);
      setError("Unable to fetch recommendations");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="dashboard-card crop-card"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="card-header">
        <h3>{t("dashboard.cropRecommendations") || "Crop Recommendations"}</h3>
        <MdAgriculture size={24} className="card-icon" />
      </div>

      {loading ? (
        <LoadingSpinner fullPage={false} message="Fetching recommendations..." />
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchRecommendations}>
            Retry
          </button>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="recommendations-list">
          {recommendations.slice(0, 3).map((crop, idx) => (
            <motion.div
              key={idx}
              className="recommendation-item"
              whileHover={{ x: 5 }}
            >
              <div className="recommendation-header">
                <span className="crop-name">{crop.crop || crop.name}</span>
                <span className="suitability">
                  {crop.suitability || crop.score}%
                </span>
              </div>
              <p className="reason">{crop.reason || crop.description}</p>
              <div className="recommendation-meta">
                <span className="season">
                  {crop.season || "All Seasons"}
                </span>
                <span className="yield">
                  Yield: {crop.yield || "--"} kg/acre
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="no-data">{t("dashboard.noData") || "No recommendations"}</p>
      )}
    </motion.div>
  );
};

export default CropRecommendationCard;
