import React from "react";
import { useNavigate } from "react-router-dom";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Pie, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Analytics() {
  const navigate = useNavigate();

  // Profit Chart
  const profitData = {
    labels: ["Rice", "Maize", "Wheat"],
    datasets: [
      {
        label: "Profit (₹)",
        data: [50000, 70000, 60000],
        backgroundColor: [
          "#4CAF50",
          "#66BB6A",
          "#81C784",
        ],
      },
    ],
  };

  // Crop Statistics
  const cropData = {
    labels: ["Rice", "Maize", "Wheat"],
    datasets: [
      {
        data: [40, 35, 25],
        backgroundColor: [
          "#4CAF50",
          "#2196F3",
          "#FF9800",
        ],
      },
    ],
  };

  // Weather Trend
  const weatherData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Temperature (°C)",
        data: [28, 30, 27, 29, 31],
        borderColor: "#4CAF50",
        backgroundColor: "#4CAF50",
        tension: 0.4,
      },
    ],
  };

  return (
    <div
      style={{
        background: "#eef6ee",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1 style={{ color: "#2e7d32" }}>
            🌿 Analytics Dashboard
          </h1>

          <p style={{ color: "#555" }}>
            Insights and Analytics for Smart Farming
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          style={{
            background: "#4CAF50",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Profit Chart */}
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ color: "#2e7d32" }}>
          📊 Profit Overview (₹)
        </h2>

        <Bar data={profitData} />
      </div>

      {/* Bottom Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        {/* Pie Chart */}
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ color: "#2e7d32" }}>
            🌱 Crop Statistics
          </h2>

          <p>
            Distribution of recommended crops based on suitability.
          </p>

          <Pie data={cropData} />
        </div>

        {/* Weather Chart */}
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ color: "#2e7d32" }}>
            📈 Weather Trend (Temperature)
          </h2>

          <p>
            Temperature trend over the past 5 days.
          </p>

          <Line data={weatherData} />
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "25px",
          background: "#dff0df",
          padding: "12px",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        🌾 Smart Farmer Advisory System © 2026 |
        Helping Farmers, Improving Future
      </div>
    </div>
  );
}

export default Analytics;