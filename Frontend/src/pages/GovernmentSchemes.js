import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";
import "../styles/GovernmentSchemes.css";

function GovernmentSchemes() {
  const navigate = useNavigate();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFarmerType, setSelectedFarmerType] = useState("All");

  // Comprehensive Dataset of Indian Agricultural Schemes
  const schemes = [
    {
      name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
      category: "Subsidy",
      state: "Pan-India",
      farmerType: "Small/Marginal",
      benefit: "Direct income support of ₹6,000 per year in three equal installments of ₹2,000.",
      eligibility: "Landholding farmer families with cultivable land in their names.",
      applyUrl: "https://pmkisan.gov.in/",
    },
    {
      name: "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
      category: "Insurance",
      state: "Pan-India",
      farmerType: "All",
      benefit: "Low premium crop insurance (2% Kharif, 1.5% Rabi) covering yield losses due to natural calamities, pests & diseases.",
      eligibility: "All farmers including sharecroppers and tenant farmers growing notified crops.",
      applyUrl: "https://pmfby.gov.in/",
    },
    {
      name: "Kisan Credit Card (KCC) Scheme",
      category: "Credit/Loans",
      state: "Pan-India",
      farmerType: "All",
      benefit: "Short term credit loans up to ₹3 Lakhs at a subsidized interest rate of 4% (upon prompt repayment).",
      eligibility: "All farmers, owner-cultivators, tenant farmers, and sharecroppers.",
      applyUrl: "https://www.myscheme.gov.in/schemes/kcc",
    },
    {
      name: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
      category: "Irrigation",
      state: "Pan-India",
      farmerType: "All",
      benefit: "Subsidies up to 55% for Small/Marginal farmers and 45% for others on Drip & Sprinkler micro-irrigation installation.",
      eligibility: "Farmers owning agricultural land. Members of water user associations.",
      applyUrl: "https://pmksy.gov.in/",
    },
    {
      name: "Soil Health Card Scheme",
      category: "Machinery/Soil",
      state: "Pan-India",
      farmerType: "All",
      benefit: "Provides Soil Health Cards specifying soil nutrient status and customized dosage of fertilizers for 12 parameters.",
      eligibility: "All land-owning farmers across India.",
      applyUrl: "https://soilhealth.dac.gov.in/",
    },
    {
      name: "PM-KUSUM (Solar Pump Subsidy)",
      category: "Subsidy",
      state: "Pan-India",
      farmerType: "All",
      benefit: "Up to 60% subsidy for installing solar water pumps for irrigation and solarizing existing grid-connected pumps.",
      eligibility: "Individual farmers, groups of farmers, panchayats, and cooperatives.",
      applyUrl: "https://mnre.gov.in/pm-kusum-scheme",
    },
    {
      name: "SMAM (Sub-Mission on Agricultural Mechanization)",
      category: "Machinery/Soil",
      state: "Pan-India",
      farmerType: "Small/Marginal",
      benefit: "Subsidies from 40% to 50% for purchasing agricultural machineries (Tractors, Tillers, Harvesters, etc.).",
      eligibility: "Small, marginal, SC/ST, and women farmers have priority.",
      applyUrl: "https://agrimachinery.nic.in/",
    },
    {
      name: "Karnataka Ganga Kalyana Scheme",
      category: "Irrigation",
      state: "Karnataka",
      farmerType: "Small/Marginal",
      benefit: "Drilling of borewells or open wells with pump set installation and electrical wiring, completely subsidized.",
      eligibility: "Small & marginal farmers belonging to SC/ST and minority categories in Karnataka.",
      applyUrl: "https://karnataka.gov.in/",
    },
    {
      name: "Maharashtra Dr. Babasaheb Ambedkar Krishi Swavalamban Yojana",
      category: "Subsidy",
      state: "Maharashtra",
      farmerType: "Small/Marginal",
      benefit: "Financial assistance up to ₹2.5 Lakhs for new borewells, engine pump sets, micro-irrigation, and farm ponds.",
      eligibility: "Scheduled Caste (SC) / Scheduled Tribe (ST) small & marginal farmers in Maharashtra.",
      applyUrl: "https://mahadbt.maharashtra.gov.in/",
    },
    {
      name: "Uttar Pradesh Paradarshi Kisan Seva Yojana",
      category: "Subsidy",
      state: "Uttar Pradesh",
      farmerType: "All",
      benefit: "Direct Benefit Transfer (DBT) subsidies on quality seeds, bio-pesticides, and chemical fertilizers.",
      eligibility: "Registered farmers on the UP Agriculture portal.",
      applyUrl: "https://upagriculture.com/",
    },
    {
      name: "Punjab Agri Export Subsidy Scheme",
      category: "Subsidy",
      state: "Punjab",
      farmerType: "All",
      benefit: "Subsidy on transportation costs and air freights for exporting fresh fruits, vegetables, and flowers.",
      eligibility: "Exporter farmers and agricultural cooperatives in Punjab.",
      applyUrl: "http://www.pagrexco.com/",
    },
  ];

  // Filters Lists
  const statesList = ["All", "Pan-India", "Karnataka", "Maharashtra", "Uttar Pradesh", "Punjab"];
  const categoriesList = ["All", "Subsidy", "Insurance", "Credit/Loans", "Irrigation", "Machinery/Soil"];
  // Farmer type options rendered inline in JSX

  // Filter Logic
  const filteredSchemes = schemes.filter((scheme) => {
    const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.benefit.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesState = selectedState === "All" || 
      scheme.state === "Pan-India" || 
      scheme.state === selectedState;

    const matchesCategory = selectedCategory === "All" || 
      scheme.category === selectedCategory;

    const matchesFarmerType = selectedFarmerType === "All" || 
      scheme.farmerType === "All" || 
      scheme.farmerType === selectedFarmerType;

    return matchesSearch && matchesState && matchesCategory && matchesFarmerType;
  });

  return (
    <div className="schemes-page">
      <div className="schemes-card">
        {/* Header */}
        <div className="schemes-header">
          <div>
            <h1 className="schemes-title">🌾 Government Schemes & Subsidies</h1>
            <p className="assistant-subtitle" style={{ margin: "0.2rem 0 0 0" }}>
              Find active Central and State government programs matching your farm profile.
            </p>
          </div>
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={16} style={{ marginRight: "6px" }} />
            Back
          </button>
        </div>

        {/* Filters Controls Row */}
        <div className="filters-row">
          <div style={{ position: "relative" }}>
            <input
              type="text"
              className="search-input-field"
              placeholder="Search scheme name or key benefits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search style={{ position: "absolute", right: "12px", top: "14px", color: "#888" }} />
          </div>

          <div>
            <select
              className="filter-select-field"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option value="All">📍 State: All Regions</option>
              {statesList.slice(1).map((st, idx) => (
                <option key={idx} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="filter-select-field"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">📂 Category: All Types</option>
              {categoriesList.slice(1).map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="filter-select-field"
              value={selectedFarmerType}
              onChange={(e) => setSelectedFarmerType(e.target.value)}
            >
              <option value="All">👨‍🌾 Farmer: All Scales</option>
              <option value="Small/Marginal">Small & Marginal Farmers</option>
              <option value="All">Medium & Large Farmers</option>
            </select>
          </div>
        </div>

        {/* Schemes Results Grid */}
        {filteredSchemes.length === 0 ? (
          <div style={{ padding: "4rem", textAlign: "center", color: "#95a5a6" }}>
            <h3>No Schemes Match Your Filters</h3>
            <p>Try clearing some search terms or choosing "All Regions".</p>
          </div>
        ) : (
          <div className="schemes-grid">
            <AnimatePresence>
              {filteredSchemes.map((scheme, index) => (
                <motion.div
                  className="scheme-card-item"
                  key={index}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="scheme-category-tag">{scheme.category}</span>
                  <h3>{scheme.name}</h3>
                  
                  <p style={{ marginTop: "0.8rem" }}>
                    <strong>Benefits:</strong> {scheme.benefit}
                  </p>
                  <p>
                    <strong>Eligibility:</strong> {scheme.eligibility}
                  </p>

                  <div className="scheme-meta-info">
                    <span>Region: <strong>{scheme.state}</strong></span>
                    <span>Scale: <strong>{scheme.farmerType === "All" ? "All Farmers" : "Small/Marginal"}</strong></span>
                  </div>

                  <a
                    href={scheme.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="scheme-apply-link"
                  >
                    🔗 Apply Online / Read More
                  </a>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default GovernmentSchemes;