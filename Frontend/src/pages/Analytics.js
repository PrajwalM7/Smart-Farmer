
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
import "../App.css";

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
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};
  

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
    <div className="analytics-page">

      <div className="analytics-card">

        <div className="analytics-header">

          <div>
            <h1 className="analytics-title">
              🌿 Analytics Dashboard
            </h1>

            <p className="analytics-subtitle">
              Insights and Analytics for Smart Farming
            </p>
          </div>

          <button
            className="back-btn"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Back
          </button>

        </div>

        {/* Profit Chart */}

        <div className="chart-card">

          <h2>
            📊 Profit Overview (₹)
          </h2>

          <div className="bar-chart-container">
  <Bar data={profitData} 
  options={chartOptions} />
</div>

        </div>

        {/* Bottom Charts */}

        <div className="analytics-grid">

          <div className="chart-card">

            <h2>
              🌱 Crop Statistics
            </h2>

            <p>
              Distribution of recommended crops.
            </p>

            <div className="pie-chart-container">
  <Pie data={cropData} 
  options={chartOptions} 
  />
</div>

          </div>

          <div className="chart-card">

            <h2>
              📈 Weather Trend
            </h2>

            <p>
              Temperature trend over the past 5 days.
            </p>

            <div className="line-chart-container">
  <Line data={weatherData} 
  />
</div>

          </div>

        </div>

        <div className="analytics-footer">

          🌾 Smart Farmer Advisory System © 2026
          <br />
          Helping Farmers, Improving Future

        </div>

      </div>

    </div>
  );
}

export default Analytics;

