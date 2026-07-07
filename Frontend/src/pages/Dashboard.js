import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, User, Thermometer, RefreshCw } from "lucide-react";
import WeatherCard from "../components/dashboard/WeatherCard";
import MandiPricesCard from "../components/dashboard/MandiPricesCard";
import CropRecommendationCard from "../components/dashboard/CropRecommendationCard";
import ExportButton from "../components/dashboard/ExportButton";
import FertilizerAdviceCard from "../components/dashboard/FertilizerAdviceCard";
import IrrigationCard from "../components/dashboard/IrrigationCard";
import PestAlertCard from "../components/dashboard/PestAlertCard";
import YieldPredictionCard from "../components/dashboard/YieldPredictionCard";
import ProfitEstimationCard from "../components/dashboard/ProfitEstimationCard";
import AIFarmingAssistantCard from "../components/dashboard/AIFarmingAssistantCard";
import DiseaseDetectionCard from "../components/dashboard/DiseaseDetectionCard";
import AnalyticsCard from "../components/dashboard/AnalyticsCard";
import GovernmentSchemesCard from "../components/dashboard/GovernmentSchemesCard";
import ExpenseTrackerCard from "../components/dashboard/ExpenseTrackerCard";
import "../styles/Dashboard.css";

function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showProfileBanner, setShowProfileBanner] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [heroWeather, setHeroWeather] = useState(null);
  // refreshKey bumps whenever profile is updated — cards use this to re-fetch
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchProfileAndWeather = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowProfileBanner(true);
      return;
    }
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // Fetch profile
    try {
      const res = await axios.get("http://localhost:5000/profile/latest", authHeaders);
      if (!res.data || !res.data.state || !res.data.district) {
        setShowProfileBanner(true);
      } else {
        setShowProfileBanner(false);
        setProfileName(res.data.name || "");
      }
    } catch {
      setShowProfileBanner(true);
    }

    // Fetch hero weather summary
    try {
      const wRes = await axios.get("http://localhost:5000/weather", authHeaders);
      // Backend wraps response: { success: true, data: {...} }
      setHeroWeather(wRes.data?.data || wRes.data);
    } catch {
      setHeroWeather(null);
    }
  }, []);

  useEffect(() => {
    fetchProfileAndWeather();
  }, [fetchProfileAndWeather]);

  // Listen for profile updates from Profile.js — bump refreshKey to trigger card re-fetches
  useEffect(() => {
    const handler = () => {
      setRefreshKey((k) => k + 1);
      fetchProfileAndWeather();
    };
    window.addEventListener("profile-updated", handler);
    return () => window.removeEventListener("profile-updated", handler);
  }, [fetchProfileAndWeather]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const heroWeatherText = heroWeather
    ? `${heroWeather.temperature !== undefined ? heroWeather.temperature + "°C" : "--"} · ${heroWeather.district || ""}${heroWeather.state ? ", " + heroWeather.state : ""}`
    : null;

  return (
    <div id="dashboard" className="dashboard-page">

      {/* Profile Setup Banner */}
      <AnimatePresence>
        {showProfileBanner && (
          <motion.div
            className="profile-setup-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="banner-content">
              <span className="banner-icon">
                <User size={22} />
              </span>
              <div className="banner-text">
                <strong>Complete Your Farmer Profile</strong>
                <span>
                  Set your location, soil type, and preferred crop to unlock AI-powered crop recommendations, yield predictions, and profit estimates.
                </span>
              </div>
            </div>
            <div className="banner-actions">
              <motion.button
                className="banner-cta"
                onClick={() => navigate("/profile")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Set Up Profile <ArrowRight size={16} />
              </motion.button>
              <button
                className="banner-dismiss"
                onClick={() => setShowProfileBanner(false)}
                title="Dismiss"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <motion.div
        className="dashboard-hero"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="hero-content">
          <div className="hero-left">
            <h1>
              {profileName
                ? `${t("dashboard.welcome") || "Welcome back"}, ${profileName} 👋`
                : t("dashboard.title") || "Smart Farmer Advisory"}
            </h1>
            <p>
              {t("dashboard.subtitle") ||
                "Real-time AI-powered farming insights and agronomy diagnostics for better decision making."}
            </p>
          </div>
          <div className="hero-right">
            <div className="hero-date">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            {heroWeatherText && (
              <div className="hero-weather-badge">
                <Thermometer size={15} />
                <span>{heroWeatherText}</span>
              </div>
            )}
            {profileName && (
              <motion.button
                className="hero-refresh-btn"
                onClick={() => { setRefreshKey((k) => k + 1); fetchProfileAndWeather(); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Refresh all data"
              >
                <RefreshCw size={14} />
                Refresh
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Cards Grid */}
      <ExportButton targetId="dashboard" />
      <motion.div
        className="dashboard-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}><WeatherCard refreshKey={refreshKey} /></motion.div>
        <motion.div variants={itemVariants}><MandiPricesCard refreshKey={refreshKey} /></motion.div>
        <motion.div variants={itemVariants}><DiseaseDetectionCard /></motion.div>
        <motion.div variants={itemVariants}><AIFarmingAssistantCard /></motion.div>
        <motion.div variants={itemVariants}><CropRecommendationCard refreshKey={refreshKey} /></motion.div>
        <motion.div variants={itemVariants}><FertilizerAdviceCard refreshKey={refreshKey} /></motion.div>
        <motion.div variants={itemVariants}><IrrigationCard refreshKey={refreshKey} /></motion.div>
        <motion.div variants={itemVariants}><PestAlertCard refreshKey={refreshKey} /></motion.div>
        <motion.div variants={itemVariants}><YieldPredictionCard refreshKey={refreshKey} /></motion.div>
        <motion.div variants={itemVariants}><ProfitEstimationCard refreshKey={refreshKey} /></motion.div>
        <motion.div variants={itemVariants}><ExpenseTrackerCard /></motion.div>
        <motion.div variants={itemVariants}><GovernmentSchemesCard /></motion.div>
        <motion.div variants={itemVariants}><AnalyticsCard /></motion.div>
      </motion.div>
    </div>
  );
}

export default Dashboard;