import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Bar, Doughnut } from "react-chartjs-2";
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
import { ArrowLeft, Trash2, PlusCircle, DollarSign } from "lucide-react";
import "../styles/ExpenseTracker.css";

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

function ExpenseTracker() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Core transaction lists
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Financial aggregates
  const [stats, setStats] = useState({
    totals: { income: 0, expense: 0, profit: 0 },
    categoryDistribution: [],
    monthlyBreakdown: [],
  });

  // Form Fields
  const [formData, setFormData] = useState({
    crop: "",
    type: "Expense",
    category: "Miscellaneous",
    expenseType: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const categories = [
    "Seeds",
    "Fertilizer",
    "Pesticides",
    "Labor",
    "Water/Irrigation",
    "Equipment",
    "Electricity",
    "Transport",
    "Miscellaneous",
  ];

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      
      // Fetch flat transactions list
      const listResponse = await axios.get("http://localhost:5000/expense", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(listResponse.data || []);

      // Fetch statistics aggregations
      const statsResponse = await axios.get("http://localhost:5000/expense/statistics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsResponse.data && statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
    } catch (error) {
      console.error("Failed to load financial records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.crop.trim() || !formData.amount) {
      setSubmitError("Please enter crop name and amount.");
      return;
    }
    setSubmitError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/expense", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Reset form
      setFormData({
        crop: "",
        type: "Expense",
        category: "Miscellaneous",
        expenseType: "",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });

      fetchFinancialData();
    } catch (error) {
      console.error("Submit transaction error:", error);
    }
  };

  const deleteTransaction = async (id) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }
    setDeleteConfirm(null);

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/expense/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFinancialData();
    } catch (error) {
      console.error("Delete transaction error:", error);
    }
  };

  // Setup Chart configs
  const categoryChartData = {
    labels: stats.categoryDistribution.map((c) => c.category),
    datasets: [
      {
        data: stats.categoryDistribution.map((c) => c.amount),
        backgroundColor: [
          "#2ecc71",
          "#3498db",
          "#e74c3c",
          "#f1c40f",
          "#9b59b6",
          "#1abc9c",
          "#e67e22",
          "#34495e",
          "#95a5a6",
        ],
        borderWidth: 1,
      },
    ],
  };

  const monthlyLabels = [...new Set(stats.monthlyBreakdown.map((m) => m.month))];
  const monthlyExpenseData = monthlyLabels.map((label) => {
    const item = stats.monthlyBreakdown.find((m) => m.month === label && m.type === "Expense");
    return item ? item.amount : 0;
  });
  const monthlyIncomeData = monthlyLabels.map((label) => {
    const item = stats.monthlyBreakdown.find((m) => m.month === label && m.type === "Income");
    return item ? item.amount : 0;
  });

  const monthlyChartData = {
    labels: monthlyLabels.length > 0 ? monthlyLabels : ["No Data"],
    datasets: [
      {
        label: "Income (₹)",
        data: monthlyIncomeData.length > 0 ? monthlyIncomeData : [0],
        backgroundColor: "#2ecc71",
      },
      {
        label: "Expenses (₹)",
        data: monthlyExpenseData.length > 0 ? monthlyExpenseData : [0],
        backgroundColor: "#e74c3c",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
        },
      },
    },
  };

  return (
    <div className="expense-page">
      <div className="expense-header">
        <h1 className="expense-title">
          💰 {t("navbar.expense") || "Expense Tracker"}
        </h1>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={16} style={{ marginRight: "6px" }} />
          Back
        </button>
      </div>

      {/* KPI Cards Section */}
      <div className="kpi-row" style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.3s" }}>
        <div className="kpi-card income">
          <span>Total Income</span>
          <h2>{loading ? "—" : `₹${stats.totals?.income?.toLocaleString() || "0"}`}</h2>
        </div>
        <div className="kpi-card expense">
          <span>Total Expenses</span>
          <h2>{loading ? "—" : `₹${stats.totals?.expense?.toLocaleString() || "0"}`}</h2>
        </div>
        <div className="kpi-card profit">
          <span>Net Farm Profit</span>
          <h2>{loading ? "—" : `₹${stats.totals?.profit?.toLocaleString() || "0"}`}</h2>
        </div>
      </div>

      <div className="expense-grid">
        {/* Left Form: Add Transaction */}
        <div className="expense-card">
          <h2 style={{ marginTop: 0, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <PlusCircle style={{ color: "#27ae60" }} /> Add Transaction
          </h2>
          <form className="expense-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Crop Name</label>
              <input
                type="text"
                placeholder="e.g. Potato, Rice"
                value={formData.crop}
                onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                required
              />
            </div>

            <div className="form-field">
              <label>Transaction Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Expense">Expense (Outgoing Cost)</option>
                <option value="Income">Income (Crop Sale revenue)</option>
              </select>
            </div>

            <div className="form-field">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Item Name / Type</label>
              <input
                type="text"
                placeholder="e.g. Urea fertilizer, Labor wages"
                value={formData.expenseType}
                onChange={(e) => setFormData({ ...formData, expenseType: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>Amount (₹)</label>
              <input
                type="number"
                placeholder="₹"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className="form-field">
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="form-field">
              <label>Notes</label>
              <input
                type="text"
                placeholder="Optional notes"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <button type="submit" className="expense-btn">
              Add Record
            </button>
            {submitError && (
              <p style={{ color: "#e74c3c", fontSize: "0.83rem", marginTop: "0.5rem", fontWeight: 500 }}>
                ⚠️ {submitError}
              </p>
            )}
          </form>
        </div>

        {/* Right Table: Ledger History */}
        <div className="expense-card" style={{ display: "flex", flexDirection: "column" }}>
          <h2 style={{ marginTop: 0, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <DollarSign style={{ color: "#3498db" }} /> Transaction Ledger
          </h2>

          <div className="transaction-table-wrapper" style={{ flex: 1 }}>
            {expenses.length === 0 ? (
              <p className="no-data">No transactions added yet. Log items to populate the ledger.</p>
            ) : (
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Crop</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((item) => (
                    <tr key={item._id}>
                      <td>{new Date(item.date).toLocaleDateString()}</td>
                      <td>{item.crop}</td>
                      <td>
                        <span className="category-tag">{item.category}</span>
                      </td>
                      <td>{item.expenseType || "General"}</td>
                      <td>
                        <span className={`amount-display ${item.type.toLowerCase()}`}>
                          {item.type === "Income" ? "+" : "-"} ₹{item.amount.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <button
                          style={{
                            background: deleteConfirm === item._id ? "#ffeaea" : "transparent",
                            border: deleteConfirm === item._id ? "1px solid #e74c3c" : "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            color: "#e74c3c",
                            padding: deleteConfirm === item._id ? "2px 8px" : "0",
                            fontSize: deleteConfirm === item._id ? "0.75rem" : "inherit",
                            fontWeight: 600,
                            transition: "all 0.2s",
                          }}
                          onClick={() => deleteTransaction(item._id)}
                          title={deleteConfirm === item._id ? "Click again to confirm delete" : "Delete transaction"}
                        >
                          {deleteConfirm === item._id ? "Confirm?" : <Trash2 size={16} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Financial Charts */}
      {stats.categoryDistribution.length > 0 || stats.monthlyBreakdown.length > 0 ? (
        <div className="charts-grid">
          <div className="chart-card">
            <h3>📈 Monthly Financial Statement</h3>
            <div className="chart-container-financial">
              <Bar data={monthlyChartData} options={chartOptions} />
            </div>
          </div>

          <div className="chart-card">
            <h3>🍩 Expense Distribution by Category</h3>
            <div className="chart-container-financial">
              {stats.categoryDistribution.length > 0 ? (
                <Doughnut data={categoryChartData} options={chartOptions} />
              ) : (
                <p className="no-data" style={{ padding: "4rem" }}>No outgoing expenses logged to chart.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ExpenseTracker;