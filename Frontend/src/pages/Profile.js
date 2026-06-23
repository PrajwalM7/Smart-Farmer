
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

function Profile() {
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
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/profile/latest"
      );

      if (res.data) {
        setFormData(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (formData._id) {
        await axios.put(
          `http://localhost:5000/profile/${formData._id}`,
          formData
        );

        alert("Profile Updated Successfully");
      } else {
        await axios.post(
          "http://localhost:5000/profile",
          formData
        );

        alert("Profile Saved Successfully");
      }

      fetchProfile();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="profile-page">

      <div className="profile-card">

  <div className="profile-header">
    <button
      className="back-btn"
      onClick={() => navigate("/dashboard")}
    >
      ← Back
    </button>
  </div>

        <h1 className="profile-title">
          👨‍🌾 Farmer Profile
        </h1>

        <p className="profile-subtitle">
          Manage your farming information
        </p>

        <form
          className="profile-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Village</label>
            <input
              type="text"
              name="village"
              value={formData.village}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>District</label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Farm Size (Acres)</label>
            <input
              type="text"
              name="farmSize"
              value={formData.farmSize}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Soil Type</label>
            <input
              type="text"
              name="soilType"
              value={formData.soilType}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Preferred Crop</label>
            <input
              type="text"
              name="preferredCrop"
              value={formData.preferredCrop}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="profile-btn"
          >
            {formData._id
              ? "Update Profile"
              : "Save Profile"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default Profile;
