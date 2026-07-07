import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";
import { FiCloud, FiDroplet, FiWind } from "react-icons/fi";
import LoadingSpinner from "../LoadingSpinner";
import "../../styles/DashboardCards.css";

const WeatherCard = ({ refreshKey = 0 }) => {
  const { t } = useLanguage();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/weather", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Fallback UI when AI service is unavailable
      if (response.data && response.data.success === false) {
        setError(response.data.message || "AI service temporarily unavailable.");
        setWeather(null);
        return;
      }
      // Backend wraps response in { success: true, data: {...} }
      setWeather(response.data?.data || response.data);
      setError(null);
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError("Unable to fetch weather data");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather, refreshKey]);



  return (
    <motion.div
      className="dashboard-card weather-card"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="card-header">
        <h3>{t("dashboard.weather") || "Weather"}</h3>
        <FiCloud size={24} className="card-icon" />
      </div>

      {loading ? (
        <LoadingSpinner fullPage={false} message="Loading weather..." />
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchWeather}>
            Retry
          </button>
        </div>
      ) : weather ? (
        <div className="weather-content">
          <div className="weather-location" style={{ fontSize: "0.95rem", color: "var(--text-secondary)", fontWeight: "500", marginTop: "-0.5rem" }}>
            📍 {weather.district || "N/A"}, {weather.state || "N/A"}
          </div>

          <div className="weather-main">
            <div className="temperature">
              <span className="value">{weather.temperature !== undefined ? `${weather.temperature}°C` : "--"}</span>
              <span className="label">{t("weather.temperature") || "Temperature"}</span>
            </div>
            <div className="condition" style={{ flex: 1, paddingLeft: "1rem" }}>
              <p style={{ margin: 0, fontWeight: "600", color: "var(--primary-color)" }}>
                {weather.advisory || "Weather is suitable for farming."}
              </p>
            </div>
          </div>

          <div className="weather-details" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}>
            <div className="detail">
              <div style={{ fontSize: "1.2rem", marginRight: "0.25rem" }}>🌡️</div>
              <div>
                <span className="label">{t("weather.feelsLike") || "Feels Like"}</span>
                <span className="value">{weather.feelsLike !== undefined ? `${weather.feelsLike}°C` : "--"}</span>
              </div>
            </div>
            <div className="detail">
              <FiDroplet size={18} />
              <div>
                <span className="label">{t("weather.humidity") || "Humidity"}</span>
                <span className="value">{weather.humidity !== undefined ? `${weather.humidity}%` : "--"}</span>
              </div>
            </div>
            <div className="detail">
              <FiWind size={18} />
              <div>
                <span className="label">{t("weather.wind") || "Wind"}</span>
                <span className="value">{weather.windSpeed !== undefined ? `${weather.windSpeed} km/h` : "--"}</span>
              </div>
            </div>
            <div className="detail">
              <div style={{ fontSize: "1.2rem", marginRight: "0.25rem" }}>🌅</div>
              <div>
                <span className="label">Sunrise</span>
                <span className="value">{weather.sunrise || "--:--"}</span>
              </div>
            </div>
            <div className="detail">
              <div style={{ fontSize: "1.2rem", marginRight: "0.25rem" }}>🌇</div>
              <div>
                <span className="label">Sunset</span>
                <span className="value">{weather.sunset || "--:--"}</span>
              </div>
            </div>
          </div>

          {weather.forecast && weather.forecast.length > 0 && (
            <div className="forecast">
              <h4>{t("weather.forecast") || "7-Day Forecast"}</h4>
              <div className="forecast-list">
                {weather.forecast.slice(0, 3).map((day, idx) => (
                  <div key={idx} className="forecast-item">
                    <span className="day">{day.day}</span>
                    <span className="temp">{day.temp}°</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </motion.div>
  );
};

export default WeatherCard;
