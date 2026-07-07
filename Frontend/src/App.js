import React, { useState, Suspense, lazy } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./App.css";

// Lazy loaded pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Analytics = lazy(() => import("./pages/Analytics"));
const ExpenseTracker = lazy(() => import("./pages/ExpenseTracker"));
const AIFarmingAssistant = lazy(() =>
  import("./pages/AIFarmingAssistant")
);
const DiseaseDetection = lazy(() =>
  import("./pages/DiseaseDetection")
);
const GovernmentSchemes = lazy(() =>
  import("./pages/GovernmentSchemes")
);

const AppContent = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const { darkMode: contextDarkMode } = useLanguage();
  const location = useLocation();

  const token = localStorage.getItem("token");

  // Pages where navbar should NOT appear
  const authPages = ["/", "/login", "/register"];

  const showNavbar =
    token && !authPages.includes(location.pathname);

  return (
    <ErrorBoundary>
      <div
        className={`app ${
          darkMode || contextDarkMode ? "dark" : "light"
        }`}
      >
        {showNavbar && (
          <Navbar
            darkMode={darkMode || contextDarkMode}
            setDarkMode={setDarkMode}
          />
        )}

        <main
          className={
            showNavbar
              ? "main-content"
              : "main-content auth-page"
          }
        >
          <Suspense
            fallback={<LoadingSpinner fullPage={true} />}
          >
            <Routes>
              {/* Auth Routes */}
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Pages */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/analytics" element={<Analytics />} />

              <Route
                path="/expense-tracker"
                element={<ExpenseTracker />}
              />
              <Route
                path="/expense"
                element={<ExpenseTracker />}
              />

              <Route
                path="/government-schemes"
                element={<GovernmentSchemes />}
              />
              <Route
                path="/schemes"
                element={<GovernmentSchemes />}
              />

              <Route
                path="/disease"
                element={<DiseaseDetection />}
              />

              <Route
                path="/assistant"
                element={<AIFarmingAssistant />}
              />
            </Routes>
          </Suspense>
        </main>
      </div>
    </ErrorBoundary>
  );
};

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;