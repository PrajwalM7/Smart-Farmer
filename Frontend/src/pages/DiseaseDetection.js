import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  UploadCloud,
  Trash2,
  FileText,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Database,
} from "lucide-react";
import "../styles/DiseaseDetection.css";

function DiseaseDetection() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const fileInputRef = useRef(null);

  // Core Diagnostic States
  const [crop, setCrop] = useState("Auto-detect");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("symptoms");

  const loadingMessages = useMemo(() => [
    "Analyzing leaf...",
    "Checking pigmentation...",
    "Extracting disease features...",
    "Running TensorFlow inference...",
  ], []);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
    } else {
      setLoadingMessageIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading, loadingMessages.length]);

  // Drag and Drop States
  const [dragActive, setDragActive] = useState(false);

  // History States
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoadingHistory(true);
      const res = await axios.get("http://localhost:5000/api/disease/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && res.data.success) {
        setHistory(res.data.data);
      }
    } catch (error) {
      console.error("Failed to retrieve diagnostic history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, WEBP)");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null); // Clear previous output
    setError(null);
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const detectDisease = async () => {
    if (!image) {
      setError("Please upload a leaf image.");
      return;
    }



    try {
      setLoading(true);
      setError(null);
      setResult(null);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", image);
      formData.append("crop", crop);

      console.log("Uploading image...");
      console.log("Waiting for backend...");
      const response = await axios.post(
        "http://localhost:5000/api/disease",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (response.data && response.data.success) {
        console.log("Prediction received.");
        setResult(response.data.data);
        setActiveTab("symptoms"); // Reset tab focus
        fetchHistory(); // Refresh history
      } else {
        setError("Disease detection yielded an invalid response format.");
      }
    } catch (err) {
      console.error("Disease prediction error:", err);
      setError(err.response?.data?.message || "Disease detection failed. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (id, diseaseName) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(
        `http://localhost:5000/api/disease/report/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Crop-Disease-Report-${diseaseName.replace(/\s+/g, "-")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Failed to download PDF report:", error);
      setError("Failed to generate and download PDF report.");
    }
  };

  const deleteHistoryItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this scan from history?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/disease/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(history.filter((item) => item._id !== id));
      if (result && result.historyId === id) {
        setResult(null); // Clear result if current view is deleted
      }
    } catch (error) {
      console.error("Failed to delete history item:", error);
      setError("Delete failed.");
    }
  };

  // Color helper for progress bar and badges
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "#e74c3c";
      case "medium":
        return "#f39c12";
      case "low":
        return "#3498db";
      case "healthy":
        return "#2ecc71";
      default:
        return "#95a5a6";
    }
  };

  return (
    <div className="disease-page">
      <div className="disease-header">
        <h1 className="disease-title">
          🌿 {t("disease.title") || "Disease Detection"}
        </h1>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={16} style={{ marginRight: "6px" }} />
          Back
        </button>
      </div>

      <p className="disease-subtitle">
        Upload or drag-and-drop a leaf image to instantly diagnose crop diseases and receive remedies.
      </p>

      <div className="disease-grid-layout">
        {/* Left Side: Scanner / Upload */}
        <motion.div
          className="disease-card"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "1.5rem" }}>Upload Specimen</h2>

          <div
            className={`drag-drop-area ${dragActive ? "drag-active" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="file-input"
              accept="image/*"
              onChange={handleFileChange}
            />
            <UploadCloud className="upload-icon" />
            <p>Drag & Drop specimen leaf photo here</p>
            <p style={{ fontSize: "0.9rem", color: "#666" }}>or <strong>click to browse files</strong></p>
            <p className="file-limit">Supports JPG, PNG, WEBP (Max 5MB)</p>
          </div>

          <div className="crop-select-group">
            <label>Crop Category</label>
            <select
              className="crop-dropdown"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
            >
              <option value="Auto-detect">🔍 Auto-detect (AI Classification)</option>
              <option value="Potato">Potato</option>
              <option value="Tomato">Tomato</option>
              <option value="Rice">Rice</option>
              <option value="Maize">Maize</option>
              <option value="Cotton">Cotton</option>
              <option value="Sugarcane">Sugarcane</option>
              <option value="Wheat">Wheat</option>
              <option value="Banana">Banana</option>
              <option value="Mango">Mango</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {preview && (
            <div className="preview-container">
              <img src={preview} alt="Leaf Preview" className="preview-image" />
              <button className="remove-img-btn" onClick={removeImage} title="Remove image">
                &times;
              </button>
            </div>
          )}

          <button
            className="detect-btn"
            onClick={detectDisease}
            disabled={!image || loading}
          >
            {loading ? loadingMessages[loadingMessageIndex] : "🔍 Run Diagnostics"}
          </button>

          {/* Inline error message for input-level errors */}
          {error && !loading && (
            <div className="inline-error-banner">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}
        </motion.div>

        {/* Right Side: AI Diagnostic Output */}
        <motion.div
          className="disease-card"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {loading ? (
            <div className="loading-state-panel">
              <div className="loading-leaf-icon">🌿</div>
              <h3 className="loading-stage-text">{loadingMessages[loadingMessageIndex]}</h3>
              <div className="loading-dots">
                <span /><span /><span />
              </div>
              <p className="loading-sub">Please wait while AI processes the image...</p>
            </div>
          ) : error ? (
            <div className="error-card">
              <div className="error-card-icon">❌</div>
              <h3 className="error-card-title">Diagnosis Failed</h3>
              <p className="error-card-desc">We couldn't identify the disease from this image.</p>
              <div className="error-reasons">
                <p className="error-reasons-title">Possible reasons:</p>
                <ul>
                  <li>Image is blurry or low resolution</li>
                  <li>Wrong crop selected</li>
                  <li>Leaf not clearly visible</li>
                  <li>Unsupported crop type</li>
                  <li>AI server unavailable</li>
                </ul>
                {error && <p className="error-detail-msg">{error}</p>}
              </div>
              <div className="error-card-actions">
                <button className="error-btn-retry" onClick={() => { setError(null); setResult(null); }}>
                  🔄 Try Again
                </button>
                <button className="error-btn-upload" onClick={() => { removeImage(); }}>
                  📁 Upload New Image
                </button>
              </div>
            </div>
          ) : result ? (
            <div className="result-container">
              <div className="result-header-row">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h2>{result.disease_name}</h2>
                    {result.severity === "healthy" ? (
                      <CheckCircle color="#2ecc71" size={24} />
                    ) : (
                      <AlertTriangle color="#e74c3c" size={24} />
                    )}
                  </div>
                  <span className="history-crop-tag" style={{ display: "block", marginTop: "4px" }}>
                    Crop: <strong>{result.crop}</strong>
                  </span>
                </div>
                <span
                  className={`status-badge ${
                    result.severity === "healthy"
                      ? "success"
                      : result.severity === "high"
                      ? "danger"
                      : "warning"
                  }`}
                >
                  {result.severity}
                </span>
              </div>

              {/* Confidence progress bar */}
              <div className="progress-container">
                <div className="progress-label-row">
                  <span>Confidence Level</span>
                  <span>{result.confidence_score?.toFixed(1)}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${result.confidence_score}%`,
                      backgroundColor: getSeverityColor(result.severity),
                    }}
                  />
                </div>
              </div>

              {/* Tabs Panel */}
              <div className="tabs-header">
                {result.severity !== "healthy" && (
                  <>
                    <button
                      className={`tab-btn ${activeTab === "symptoms" ? "active" : ""}`}
                      onClick={() => setActiveTab("symptoms")}
                    >
                      Symptoms
                    </button>
                    <button
                      className={`tab-btn ${activeTab === "causes" ? "active" : ""}`}
                      onClick={() => setActiveTab("causes")}
                    >
                      Causes
                    </button>
                  </>
                )}
                <button
                  className={`tab-btn ${activeTab === "remedies" ? "active" : ""}`}
                  onClick={() => setActiveTab("remedies")}
                >
                  Remedies
                </button>
                <button
                  className={`tab-btn ${activeTab === "prevention" ? "active" : ""}`}
                  onClick={() => setActiveTab("prevention")}
                >
                  Prevention
                </button>
              </div>

              <div className="tab-pane-content">
                {activeTab === "symptoms" && result.symptoms && (
                  <ul>
                    {result.symptoms.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                )}

                {activeTab === "causes" && result.causes && (
                  <ul>
                    {result.causes.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                )}

                {activeTab === "remedies" && (
                  <div>
                    {result.treatmentOrganic && result.treatmentOrganic.length > 0 && (
                      <div className="organic-solution">
                        <h4 style={{ color: "#2e7d32" }}>🌿 Organic / Eco-Friendly</h4>
                        <ul>
                          {result.treatmentOrganic.map((t, idx) => (
                            <li key={idx}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.treatmentChemical && result.treatmentChemical.length > 0 && result.severity !== "healthy" && (
                      <div className="chemical-solution">
                        <h4 style={{ color: "#2980b9" }}>🧪 Chemical Controls</h4>
                        <ul>
                          {result.treatmentChemical.map((t, idx) => (
                            <li key={idx}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.severity === "healthy" && (
                      <p>Plants are healthy. No remedy application required.</p>
                    )}
                  </div>
                )}

                {activeTab === "prevention" && result.prevention && (
                  <ul>
                    {result.prevention.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                )}
              </div>

              {result.historyId && (
                <div className="result-actions">
                  <button
                    className="download-pdf-btn"
                    onClick={() => downloadReport(result.historyId, result.disease_name)}
                  >
                    <FileText size={18} />
                    Download PDF Report
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                padding: "2rem",
                color: "#7f8c8d",
                textAlign: "center",
              }}
            >
              <UploadCloud size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
              <h3>Awaiting Diagnosis</h3>
              <p>Please select a crop category, upload a leaf image, and run the diagnostic scanner to see results.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* History section */}
      <div className="history-section">
        <h2>
          <Database /> Saved Diagnostics History
        </h2>
        {loadingHistory ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <LoadingSpinner message="Retrieving saved history logs..." />
          </div>
        ) : history.length === 0 ? (
          <p className="no-data">No history records found. Scanned specimens will appear here.</p>
        ) : (
          <div className="history-grid">
            <AnimatePresence>
              {history.map((item) => (
                <motion.div
                  className="history-item-card"
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="history-img-wrapper">
                    {item.imageUrl ? (
                      <img src={`http://localhost:5000${item.imageUrl}`} alt={item.diseaseName} />
                    ) : (
                      <div
                        style={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#e0e0e0",
                        }}
                      >
                        🍂
                      </div>
                    )}
                    <span className="history-date-badge">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="history-details">
                    <h4>{item.diseaseName}</h4>
                    <div className="history-crop-tag">
                      Crop: <strong>{item.crop}</strong>
                    </div>

                    <div className="history-metric-row">
                      <span>
                        Severity:{" "}
                        <strong style={{ color: getSeverityColor(item.severity), textTransform: "uppercase" }}>
                          {item.severity}
                        </strong>
                      </span>
                      <span>
                        Conf: <strong>{item.confidence?.toFixed(1)}%</strong>
                      </span>
                    </div>

                    <div className="history-footer-actions">
                      <button
                        className="history-pdf-btn"
                        onClick={() => downloadReport(item._id, item.diseaseName)}
                      >
                        <FileText size={14} /> PDF
                      </button>
                      <button
                        className="history-delete-btn"
                        onClick={() => deleteHistoryItem(item._id)}
                        title="Delete record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default DiseaseDetection;