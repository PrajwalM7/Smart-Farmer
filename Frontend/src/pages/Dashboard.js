import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Dashboard() {
  const [weather, setWeather] = useState(null);
  const [mandiData, setMandiData] = useState([]);
  const [cropData, setCropData] = useState([]);
  const [fertilizerData, setFertilizerData] = useState([]);
  const [profitData, setProfitData] = useState(null);
  const [city, setCity] = useState("Bangalore");

  const navigate = useNavigate();

  useEffect(() => {
    fetchWeather();
  }, [city]);

  useEffect(() => {
    fetchMandiPrices();
    fetchCropRecommendations();
    fetchFertilizerSuggestions();
    fetchProfit();
  }, []);

  const fetchWeather = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/weather?city=${city}`
      );
      setWeather(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchMandiPrices = async () => {
    try {
      const res = await axios.get("http://localhost:5000/mandi");
      setMandiData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCropRecommendations = async () => {
    try {
      const res = await axios.get("http://localhost:5000/crop");
      setCropData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchFertilizerSuggestions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/fertilizer");
      setFertilizerData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProfit = async () => {
    try {
      const res = await axios.get("http://localhost:5000/profit");
      setProfitData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="dashboard">

      {/* Header */}
<div className="header">

  <div style={{ display: "flex", gap: "10px" }}>

    <button
      className="logout-btn"
      onClick={() => navigate("/profile")}
    >
      Profile
    </button>

    <button
      className="logout-btn"
      onClick={() => navigate("/analytics")}
    >
      Analytics
    </button>

  </div>

  <h1 className="title">
    🌾 Smart Farmer Advisory System
  </h1>

  <button
    className="logout-btn"
    onClick={handleLogout}
  >
    Logout
  </button>

</div>

      {/* Description */}
      <p className="subtitle">
        Helping farmers make better decisions using weather insights,
        mandi prices, crop recommendations, fertilizer suggestions,
        and profit estimation.
      </p>

      {/* City Selector */}
      <div
        style={{
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        <label>
          <strong>Select City: </strong>
        </label>

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "5px",
            marginLeft: "10px",
          }}
        >
          <option value="Bangalore">Bangalore</option>
          <option value="Mysore">Mysore</option>
          <option value="Tumkur">Tumkur</option>
          <option value="Belagavi">Belagavi</option>
          <option value="Hubli">Hubli</option>
        </select>
      </div>

      {/* Cards */}
      <div className="cards">

        {/* Weather */}
        <div className="card">
          <h3>🌦 Weather Advisory</h3>

          {weather ? (
            <>
              <p>
                <strong>City:</strong> {city}
              </p>

              <p>
                <strong>Temperature:</strong>{" "}
                {weather.temperature}°C
              </p>

              <p>
                <strong>Humidity:</strong>{" "}
                {weather.humidity}%
              </p>

              <p>
                <strong>Wind Speed:</strong>{" "}
                {weather.windSpeed} km/h
              </p>

              <p>
                <strong>Advisory:</strong>{" "}
                {weather.temperature > 35
                  ? "High temperature. Irrigate crops adequately."
                  : weather.humidity > 80
                  ? "High humidity. Watch for fungal diseases."
                  : "Weather conditions are suitable for farming activities."}
              </p>
            </>
          ) : (
            <p>Loading Weather...</p>
          )}
        </div>

        {/* Mandi Prices */}
       <div className="card mandi-card">
  <h3>📈 Live Mandi Prices</h3>

  <div style={{ overflowX: "auto" }}>
    <table>
      <thead>
        <tr>
          <th>Commodity</th>
          <th>Market</th>
          <th>State</th>
          <th>Price (₹)</th>
        </tr>
      </thead>

      <tbody>
        {mandiData.slice(0, 5).map((item, index) => (
          <tr key={index}>
            <td>
              {item.Commodity.length > 15
                ? item.Commodity.substring(0, 15) + "..."
                : item.Commodity}
            </td>

            <td>{item.Market}</td>

            <td>{item.State}</td>

            <td>
              ₹{item.Modal_Price}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

        {/* Crop Recommendation */}
        <div className="card">
          <h3>🌱 Crop Recommendation</h3>

          {cropData.map((item, index) => (
            <p key={index}>
              <strong>{item.crop}</strong>
              <br />
              Season: {item.season}
              <br />
              Suitability: {item.suitability}
            </p>
          ))}
        </div>

        {/* Fertilizer Suggestion */}
        <div className="card">
          <h3>🧪 Fertilizer Suggestion</h3>

          {fertilizerData.map((item, index) => (
            <p key={index}>
              <strong>{item.crop}</strong>
              <br />
              {item.fertilizer}
              <br />
              {item.quantity}
            </p>
          ))}
        </div>

        {/* Profit Estimation */}
        <div className="card">
          <h3>💰 Profit Estimation</h3>

          {profitData ? (
            <>
              <p>
                <strong>Crop:</strong> {profitData.crop}
              </p>

              <p>
                <strong>Investment:</strong> ₹{profitData.investment}
              </p>

              <p>
                <strong>Revenue:</strong> ₹{profitData.revenue}
              </p>

              <p>
                <strong>Profit:</strong> ₹{profitData.profit}
              </p>
            </>
          ) : (
            <p>Loading Profit Data...</p>
          )}
        </div>

      </div>

      {/* Footer */}
      <footer className="footer">
        Smart Farmer Advisory System © 2026
      </footer>

    </div>
  );
}

export default Dashboard;