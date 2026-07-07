import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
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
import { ArrowLeft } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/Analytics.css";

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
  const { t } = useLanguage();

  // Statistics Data State
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/disease/statistics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load analytics statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <LoadingSpinner message="Aggregating database diagnostic records..." />
      </div>
    );
  }

  // Fallbacks if no data exists yet
  const totalScans = stats?.totalScans || 0;
  const healthDist = stats?.healthDistribution || [];
  const cropDist = stats?.cropDistribution || [];
  const severityDist = stats?.severityDistribution || [];
  const monthlyScans = stats?.monthlyScans || [];
  const commonDiseases = stats?.commonDiseases || [];

  // Helper variables for widgets
  const healthyCount = healthDist.find((h) => h.status === "Healthy")?.count || 0;
  const diseasedCount = healthDist.find((h) => h.status === "Diseased")?.count || 0;
  const topDisease = commonDiseases.length > 0 ? commonDiseases[0].disease : "None Detected";

  // Chart 1: Diagnostics Timeline (Line Chart)
  const timelineChartData = {
    labels: monthlyScans.map((m) => m.month),
    datasets: [
      {
        label: "Scans Count",
        data: monthlyScans.map((m) => m.count),
        borderColor: "#2e7d32",
        backgroundColor: "rgba(46, 125, 50, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Chart 2: Crop Distribution (Pie Chart)
  const cropChartData = {
    labels: cropDist.map((c) => c.name),
    datasets: [
      {
        data: cropDist.map((c) => c.value),
        backgroundColor: ["#2ecc71", "#3498db", "#e74c3c", "#f1c40f", "#9b59b6", "#1abc9c", "#e67e22"],
      },
    ],
  };

  // Chart 3: Disease Frequency (Bar Chart)
  const frequencyChartData = {
    labels: commonDiseases.map((d) => d.disease),
    datasets: [
      {
        label: "Diagnosed Times",
        data: commonDiseases.map((d) => d.count),
        backgroundColor: "#e74c3c",
      },
    ],
  };

  // Chart 4: Severity Levels (Doughnut Chart)
  const severityChartData = {
    labels: severityDist.map((s) => s.level.toUpperCase()),
    datasets: [
      {
        data: severityDist.map((s) => s.count),
        backgroundColor: ["#e74c3c", "#f39c12", "#3498db", "#2ecc71"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { boxWidth: 12 },
      },
    },
  };

  return (
    <div className="analytics-page">
      <div className="analytics-card">
        {/* Header */}
        <div className="analytics-header">
          <div>
            <h1 className="analytics-title">📊 {t("analytics.title") || "Analytics Dashboard"}</h1>
            <p className="analytics-subtitle">
              Visual insights on leaf diagnostics, crop distributions, and disease trends.
            </p>
          </div>
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={16} style={{ marginRight: "6px" }} />
            Back
          </button>
        </div>

        {totalScans === 0 ? (
          <div style={{ padding: "4rem", textAlign: "center", color: "#7f8c8d" }}>
            <h3>No Analytics Data Available</h3>
            <p>Upload crop leaf photos in the Disease Detection page to generate analytics.</p>
          </div>
        ) : (
          <>
            {/* KPI Summary Widgets */}
            <div className="stats-summary-row">
              <div className="stat-widget">
                <span>Total Scans Run</span>
                <h2>{totalScans}</h2>
              </div>
              <div className="stat-widget">
                <span>Healthy Samples</span>
                <h2 style={{ color: "#2ecc71" }}>{healthyCount}</h2>
              </div>
              <div className="stat-widget">
                <span>Diseased Samples</span>
                <h2 style={{ color: "#e74c3c" }}>{diseasedCount}</h2>
              </div>
              <div className="stat-widget">
                <span>Top Pathology</span>
                <h2 style={{ fontSize: "1.2rem", height: "40px", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center" }} title={topDisease}>
                  {topDisease}
                </h2>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="analytics-charts-grid">
              <div className="analytics-chart-card">
                <h3>📈 Diagnostic Scanning Trends</h3>
                <div className="chart-container-wrapper">
                  {monthlyScans.length > 0 ? (
                    <Line data={timelineChartData} options={chartOptions} />
                  ) : (
                    <p style={{ textAlign: "center", paddingTop: "5rem" }}>Insufficient timeline data.</p>
                  )}
                </div>
              </div>

              <div className="analytics-chart-card">
                <h3>🌱 Crop Distribution Scanned</h3>
                <div className="chart-container-wrapper">
                  <Pie data={cropChartData} options={chartOptions} />
                </div>
              </div>

              <div className="analytics-chart-card">
                <h3>⚠️ Diagnostic Severity Breakdown</h3>
                <div className="chart-container-wrapper">
                  <Doughnut data={severityChartData} options={chartOptions} />
                </div>
              </div>

              <div className="analytics-chart-card">
                <h3>🚨 Most Frequent Diseases</h3>
                <div className="chart-container-wrapper">
                  {commonDiseases.length > 0 ? (
                    <Bar data={frequencyChartData} options={chartOptions} />
                  ) : (
                    <p style={{ textAlign: "center", paddingTop: "5rem" }}>No diseases detected yet.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        <div className="analytics-footer">
          🌾 Smart Farmer Advisory System © 2026
          <br />
          Helping Indian Farmers Optimize Yields with AI Diagnostics.
        </div>
      </div>
    </div>
  );
}

export default Analytics;
