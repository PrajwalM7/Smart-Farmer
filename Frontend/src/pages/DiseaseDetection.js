import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

function DiseaseDetection() {
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const detectDisease = async () => {
    if (!image) {
      alert("Please select an image");
      return;
    }

    try {
      const formData = new FormData();

formData.append("image", image);

const response = await axios.post(
  "http://localhost:5000/api/disease",
  formData
);

console.log("FULL RESPONSE:", response.data);

setResult(response.data);
    } catch (error) {
      console.log(error);
      alert("Disease detection failed");
    }
  };

  return (
    <div className="disease-page">
      <div className="disease-card">

        <div className="disease-header">
          <h1 className="disease-title">
            🌿 Disease Detection
          </h1>

          <button
            className="back-btn"
            onClick={() => navigate("/dashboard")}
          >
            ← Back
          </button>
        </div>

        <p className="disease-subtitle">
          Upload a crop image to identify possible diseases
        </p>

        <div className="upload-section">

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />

          <button
            className="detect-btn"
            onClick={detectDisease}
          >
            🔍 Detect Disease
          </button>

        </div>

        {preview && (
          <div className="image-preview">
            <img
              src={preview}
              alt="Crop Preview"
            />
          </div>
        )}
{result && (
  <div className="result-card">
    <h3>Disease Detection Result</h3>

    <p>
      <strong>Disease:</strong>{" "}
      {result.data?.disease_name
  ?.replaceAll("___", " ")
  ?.replaceAll("_", " ")
}
    </p>

    <p>
      <strong>Confidence:</strong>{" "}
      {result.data?.confidence_score}%
    </p>

    <p>
      <strong>Severity:</strong>{" "}
      {result.data?.severity}
    </p>

    <p>
      <strong>Urgent Action:</strong>{" "}
      {result.data?.urgent_action_needed ? "Yes" : "No"}
    </p>
  </div>
)}

      </div>
    </div>
  );
}

export default DiseaseDetection;