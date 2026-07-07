import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";
import { MdAgriculture } from "react-icons/md";
import { FiUser, FiArrowRight } from "react-icons/fi";
import LoadingSpinner from "../LoadingSpinner";
import "../../styles/DashboardCards.css";

const ProfilePrompt = ({ message }) => {
  const navigate = useNavigate();
  return (
    <div className="card-profile-prompt">
      <span className="prompt-icon">🌱</span>
      <p>{message || "Complete your profile to get personalized AI recommendations."}</p>
      <button className="prompt-btn" onClick={() => navigate("/profile")}>
        <FiUser size={14} /> Set Up Profile <FiArrowRight size={14} />
      </button>
    </div>
  );
};

const CropRecommendationCard = ({ refreshKey = 0 }) => {
  const { t, language } = useLanguage();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noProfile, setNoProfile] = useState(false);

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setNoProfile(false);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/crop?language=${language}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Check if AI service indicated failure
      if (response.data && response.data.success === false) {
        // Fallback UI message for unavailable AI service
        setError("AI service temporarily unavailable. Please try again later.");
        setRecommendations([]);
        return;
      }
      const recs = response.data.recommendations || [];
      setRecommendations(recs);
      setError(null);
    } catch (err) {
      console.error("Crop fetch error:", err);
      const status = err?.response?.status;
      if (status === 401 || status === 404) {
        setRecommendations([]);
        setError(null);
      } else {
        setError("Unable to fetch recommendations");
      }
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations, refreshKey]);

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
      ) : noProfile ? (
        <ProfilePrompt message="Set up your farm profile (location, soil type) to get AI-powered crop recommendations." />
      ) : (
        <ProfilePrompt message="Complete your profile to get personalized crop recommendations." />
      )}
    </motion.div>
  );
};

export default CropRecommendationCard;
