import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";
import { FiTrendingUp, FiRefreshCw } from "react-icons/fi";
import LoadingSpinner from "../LoadingSpinner";
import "../../styles/DashboardCards.css";

const MandiPricesCard = ({ refreshKey = 0 }) => {
  const { t } = useLanguage();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrices = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/mandi", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Fallback UI when AI service is unavailable
      if (response.data && response.data.success === false) {
        setError(response.data.message || "AI service temporarily unavailable.");
        setPrices([]);
        return;
      }
      setPrices(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Mandi fetch error:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("No records found for this crop in your district.");
      }
      setPrices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices, refreshKey]);

  return (
    <motion.div
      className="dashboard-card mandi-card"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}

    >
      <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <FiTrendingUp size={20} className="card-icon" />
          <h3 style={{ margin: 0 }}>{t("dashboard.mandi") || "Market Prices"}</h3>
        </div>
        <motion.button
          onClick={fetchPrices}
          className="refresh-btn"
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
          title="Refresh prices"
        >
          <FiRefreshCw size={18} />
        </motion.button>
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
        <div className="prices-list" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {prices.slice(0, 5).map((price, idx) => (
            <motion.div
              key={idx}
              className="price-item"
              whileHover={{ x: 5 }}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem",
                background: "rgba(0, 0, 0, 0.02)",
                borderRadius: "8px",
                borderLeft: "4px solid var(--primary-color)"
              }}
            >
              <div className="price-crop" style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <span className="crop-name" style={{ fontWeight: "600", fontSize: "0.95rem", color: "var(--text-primary)" }}>{price.crop}</span>
                <span className="market" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  📍 {price.market} ({price.district || "N/A"})
                </span>
              </div>
              <div className="price-values" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <span className="modal" style={{ fontWeight: "700", color: "var(--primary-color)", fontSize: "1.05rem" }}>
                  ₹{price.modal}/q
                </span>
                <span className="date" style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Today</span>
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
