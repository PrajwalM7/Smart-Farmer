import React, { useState, useEffect } from "react";
import axios from "axios";

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
    <div style={{ padding: "30px" }}>
      <h1>Farmer Profile</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
        />
        <br /><br />

        <input
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
        />
        <br /><br />

        <input
          name="village"
          placeholder="Village"
          value={formData.village}
          onChange={handleChange}
        />
        <br /><br />

        <input
          name="district"
          placeholder="District"
          value={formData.district}
          onChange={handleChange}
        />
        <br /><br />

        <input
          name="state"
          placeholder="State"
          value={formData.state}
          onChange={handleChange}
        />
        <br /><br />

        <input
          name="farmSize"
          placeholder="Farm Size"
          value={formData.farmSize}
          onChange={handleChange}
        />
        <br /><br />

        <input
          name="soilType"
          placeholder="Soil Type"
          value={formData.soilType}
          onChange={handleChange}
        />
        <br /><br />

        <input
          name="preferredCrop"
          placeholder="Preferred Crop"
          value={formData.preferredCrop}
          onChange={handleChange}
        />
        <br /><br />

        <button type="submit">
          {formData._id ? "Update Profile" : "Save Profile"}
        </button>
      </form>
    </div>
  );
}

export default Profile;