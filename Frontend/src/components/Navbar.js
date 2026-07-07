import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

import { motion } from "framer-motion";
import {
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  Moon,
  Sun,
  Settings,
  LayoutDashboard,
  Activity,
  CircleDollarSign,
  ScanHeart,
  Bot,
  Landmark,
  Leaf
} from "lucide-react";
import "../styles/Navbar.css";

const Navbar = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { path: "/dashboard", label: t("navbar.dashboard"), icon: LayoutDashboard },
    { path: "/analytics", label: t("navbar.analytics"), icon: Activity },
    {
      path: "/expense-tracker",
      label: t("navbar.expense"),
      icon: CircleDollarSign,
    },
    {
      path: "/disease",
      label: t("navbar.disease"),
      icon: ScanHeart,
    },
    {
      path: "/assistant",
      label: t("navbar.assistant"),
      icon: Bot,
    },
    {
      path: "/government-schemes",
      label: t("navbar.schemes"),
      icon: Landmark,
    },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, x: 300 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      x: 300,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.nav
      className="navbar"
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <div className="navbar-container">
        {/* Logo */}
        <motion.div
          className="navbar-logo"
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/dashboard")}
        >
          <Leaf className="logo-icon" size={24} color="#F5F7FA" />
          <span className="logo-text">Smart Farmer</span>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="navbar-desktop">
          <div className="nav-links">
            {navItems.map((item) => (
              <motion.button
                key={item.path}
                className={`nav-link ${isActive(item.path) ? "active" : ""}`}
                onClick={() => navigate(item.path)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Desktop Right Section */}
          <div className="navbar-right">
            {/* Dark Mode Toggle */}
            <motion.button
              className="icon-button"
              onClick={() => setDarkMode(!darkMode)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>

            {/* Language Selector */}
            

            {/* User Dropdown */}
            <div className="user-dropdown">
              <motion.button
                className="user-button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                whileHover={{ scale: 1.05 }}
              >
                <User size={20} />
                <span>{t("navbar.profile")}</span>
                <ChevronDown
                  size={16}
                  className={`chevron ${userDropdownOpen ? "rotate" : ""}`}
                />
              </motion.button>

              {userDropdownOpen && (
                <motion.div
                  className="dropdown-menu"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/profile");
                      setUserDropdownOpen(false);
                    }}
                  >
                    <User size={16} />
                    {t("navbar.profile")}
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/profile"); // Navigate to profile where settings are located
                      setUserDropdownOpen(false);
                    }}
                  >
                    <Settings size={16} />
                    {t("common.settings")}
                  </button>
                  <div className="dropdown-divider" />
                  <button
                    className="dropdown-item logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    {t("navbar.logout")}
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="navbar-mobile">
          <motion.button
            className="icon-button"
            onClick={() => setDarkMode(!darkMode)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>

          <motion.button
            className="hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          className="mobile-menu"
          variants={mobileMenuVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="mobile-nav-links">
            {navItems.map((item) => (
              <motion.button
                key={item.path}
                className={`mobile-nav-link ${
                  isActive(item.path) ? "active" : ""
                }`}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </motion.button>
            ))}
          </div>

          <div className="mobile-menu-bottom">
            
            <motion.button
              className="mobile-logout-btn"
              onClick={handleLogout}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut size={18} />
              {t("navbar.logout")}
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
