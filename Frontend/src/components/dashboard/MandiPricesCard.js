import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";
import { FiTrendingUp } from "react-icons/fi";
import LoadingSpinner from "../LoadingSpinner";
import "../../styles/DashboardCards.css";

const MandiPricesCard = () => {
  const { t } = useLanguage();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/mandi");
      setPrices(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Mandi fetch error:", err);
      setError("Unable to fetch market prices");
      setPrices([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="dashboard-card mandi-card"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div className="card-header">
        <h3>{t("dashboard.mandi") || "Market Prices"}</h3>
        <FiTrendingUp size={24} className="card-icon" />
      </div>

      {loading ? (
        <LoadingSpinner fullPage={false} message="Loading prices..." />
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchPrices}>
            Retry
          </button>
        </div>
      ) : prices.length > 0 ? (
        <div className="prices-list">
          {prices.slice(0, 5).map((price, idx) => (
            <motion.div
              key={idx}
              className="price-item"
              whileHover={{ x: 5 }}
            >
              <div className="price-crop">
                <span className="crop-name">{price.crop}</span>
                <span className="market">{price.market || "Local Market"}</span>
              </div>
              <div className="price-values">
                <span className="modal">₹{price.modal || "--"}</span>
                <span className="date">Today</span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="no-data">{t("dashboard.noData") || "No data available"}</p>
      )}
    </motion.div>
  );
};

export default MandiPricesCard;
