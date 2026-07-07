import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowLeft, Save, User, MapPin, Cpu, Droplet } from "lucide-react";
import "../styles/Profile.css";

const SOIL_TYPES = [
  "Alluvial Soil", "Black Soil", "Black Cotton Soil", "Red Soil", "Laterite Soil",
  "Sandy Soil", "Loamy Soil", "Clay Soil", "Mountain Soil"
];

const CROPS = [
  "Rice", "Wheat", "Maize", "Cotton", "Sugarcane", "Groundnut",
  "Soybean", "Pulses", "Vegetables", "Fruits", "Spices", "Other"
];

const IRRIGATION_TYPES = [
  "Drip Irrigation", "Sprinkler", "Flood Irrigation", "Canal",
  "Borewell", "Rainwater", "None"
];

const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan",
  "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

function Profile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    phone: "",
    village: "",
    district: "",
    state: "",
    farmSize: "",
    soilType: "",
    preferredCrop: "",
    irrigationType: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/profile/latest", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data) {
        setFormData((prev) => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      // No profile yet — that's fine
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    // Destructure to ensure we never send _id or userId to the server in the request body
    const { _id, userId, __v, ...submitData } = formData;

    try {
      const token = localStorage.getItem("token");
      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
      if (_id) {
        await axios.put(`http://localhost:5000/profile/${_id}`, submitData, authHeaders);
      } else {
        const res = await axios.post("http://localhost:5000/profile", submitData, authHeaders);
        setFormData(res.data);
      }
      setSuccess("Profile saved successfully! Your dashboard will now show personalized data.");
      await fetchProfile();
      // Broadcast profile update to Dashboard and all cards
      window.dispatchEvent(new CustomEvent("profile-updated"));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const completionFields = ["name", "state", "district", "farmSize", "soilType", "preferredCrop"];
  const completionCount = completionFields.filter(f => formData[f]).length;
  const completionPct = Math.round((completionCount / completionFields.length) * 100);

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner" />
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* Header */}
        <motion.div
          className="profile-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button className="profile-back-btn" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={18} /> Back to Dashboard
          </button>

          <div className="profile-hero">
            <div className="profile-avatar">
              <span>👨‍🌾</span>
            </div>
            <div className="profile-hero-text">
              <h1>Farmer Profile</h1>
              <p>Your profile powers AI-driven farming insights</p>
            </div>
          </div>

          {/* Completion bar */}
          <div className="profile-completion">
            <div className="completion-header">
              <span className="completion-label">Profile Completion</span>
              <span className="completion-pct">{completionPct}%</span>
            </div>
            <div className="completion-track">
              <motion.div
                className="completion-fill"
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  background: completionPct === 100
                    ? "linear-gradient(90deg, #27ae60, #2ecc71)"
                    : completionPct >= 60
                    ? "linear-gradient(90deg, #f39c12, #f1c40f)"
                    : "linear-gradient(90deg, #e74c3c, #e67e22)"
                }}
              />
            </div>
            {completionPct < 100 && (
              <p className="completion-hint">
                Complete your profile to get personalized crop recommendations, yield predictions, and market insights.
              </p>
            )}
          </div>
        </motion.div>

        {/* Alerts */}
        {success && (
          <motion.div
            className="profile-alert success"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            ✅ {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            className="profile-alert error"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            ⚠️ {error}
          </motion.div>
        )}

        {/* Form */}
        <motion.form
          className="profile-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >

          {/* Section: Personal Info */}
          <div className="form-section">
            <div className="form-section-header">
              <User size={20} />
              <h2>Personal Information</h2>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="prof-name">Full Name <span className="required">*</span></label>
                <input
                  id="prof-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="prof-phone">Phone Number</label>
                <input
                  id="prof-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="prof-village">Village / Town</label>
                <input
                  id="prof-village"
                  type="text"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  placeholder="Your village or town"
                />
              </div>
            </div>
          </div>

          {/* Section: Location */}
          <div className="form-section">
            <div className="form-section-header">
              <MapPin size={20} />
              <h2>Location Details</h2>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="prof-state">State <span className="required">*</span></label>
                <select
                  id="prof-state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select State</option>
                  {STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="prof-district">District <span className="required">*</span></label>
                <input
                  id="prof-district"
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="e.g. Tumkur"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section: Farm Details */}
          <div className="form-section">
            <div className="form-section-header">
              <Cpu size={20} />
              <h2>Farm Details</h2>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="prof-farmSize">Farm Size (Acres) <span className="required">*</span></label>
                <input
                  id="prof-farmSize"
                  type="number"
                  name="farmSize"
                  value={formData.farmSize}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  min="0.1"
                  step="0.1"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="prof-soilType">Soil Type <span className="required">*</span></label>
                <select
                  id="prof-soilType"
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Soil Type</option>
                  {SOIL_TYPES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="prof-preferredCrop">Preferred Crop <span className="required">*</span></label>
                <select
                  id="prof-preferredCrop"
                  name="preferredCrop"
                  value={formData.preferredCrop}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Crop</option>
                  {CROPS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Irrigation */}
          <div className="form-section">
            <div className="form-section-header">
              <Droplet size={20} />
              <h2>Irrigation</h2>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="prof-irrigationType">Irrigation Type</label>
                <select
                  id="prof-irrigationType"
                  name="irrigationType"
                  value={formData.irrigationType}
                  onChange={handleChange}
                >
                  <option value="">Select Irrigation Type</option>
                  {IRRIGATION_TYPES.map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="profile-form-footer">
            <motion.button
              id="profile-save-btn"
              type="submit"
              className="profile-save-btn"
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save size={18} />
              {saving ? "Saving..." : formData._id ? "Update Profile" : "Save Profile"}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

export default Profile;
