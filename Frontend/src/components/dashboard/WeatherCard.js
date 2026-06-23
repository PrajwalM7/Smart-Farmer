import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";
import { FiCloud, FiDroplet, FiWind } from "react-icons/fi";
import LoadingSpinner from "../LoadingSpinner";
import "../../styles/DashboardCards.css";

const WeatherCard = () => {
  const { t } = useLanguage();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
  "http://localhost:5000/weather"
);

console.log("Weather API:", response.data);

setWeather(response.data);
      setError(null);
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError("Unable to fetch weather data");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

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
          <div className="weather-main">
            <div className="temperature">
              <span className="value">{weather.temperature || "--"}°C</span>
              <span className="label">{t("weather.temperature") || "Temperature"}</span>
            </div>
            <div className="condition">
              <p>{weather.condition || "Moderate"}</p>
            </div>
          </div>

          <div className="weather-details">
            <div className="detail">
              <FiDroplet size={18} />
              <div>
                <span className="label">{t("weather.humidity") || "Humidity"}</span>
                <span className="value">{weather.humidity || "--"}%</span>
              </div>
            </div>
            <div className="detail">
              <FiWind size={18} />
              <div>
                <span className="label">{t("weather.wind") || "Wind"}</span>
                <span className="value">{weather.windSpeed || "--"} km/h</span>
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
