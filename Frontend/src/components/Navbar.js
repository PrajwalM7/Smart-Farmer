import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "./LanguageSelector";
import { motion } from "framer-motion";
import {
  FiMenu,
  FiX,
  FiLogOut,
  FiUser,
  FiChevronDown,
  FiMoon,
  FiSun,
} from "react-icons/fi";
import {
  MdDashboard,
  MdPerson,
  MdAnalytics,
  MdAttachMoney,
  MdLeakAdd,
  MdChatBubble,
  MdSchool,
} from "react-icons/md";
import "../styles/Navbar.css";

const Navbar = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { path: "/dashboard", label: t("navbar.dashboard"), icon: MdDashboard },
    { path: "/profile", label: t("navbar.profile"), icon: MdPerson },
    { path: "/analytics", label: t("navbar.analytics"), icon: MdAnalytics },
    {
      path: "/expense-tracker",
      label: t("navbar.expense"),
      icon: MdAttachMoney,
    },
    {
      path: "/disease-detection",
      label: t("navbar.disease"),
      icon: MdLeakAdd,
    },
    {
      path: "/assistant",
      label: t("navbar.assistant"),
      icon: MdChatBubble,
    },
    {
      path: "/government-schemes",
      label: t("navbar.schemes"),
      icon: MdSchool,
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
          <span className="logo-icon">🌾</span>
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
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </motion.button>

            {/* Language Selector */}
            <LanguageSelector />

            {/* User Dropdown */}
            <div className="user-dropdown">
              <motion.button
                className="user-button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                whileHover={{ scale: 1.05 }}
              >
                <FiUser size={20} />
                <span>{t("navbar.profile")}</span>
                <FiChevronDown
                  size={16}
                  className={userDropdownOpen ? "rotate" : ""}
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
                    <FiUser size={16} />
                    {t("navbar.profile")}
                  </button>
                  <div className="dropdown-divider" />
                  <button
                    className="dropdown-item logout"
                    onClick={handleLogout}
                  >
                    <FiLogOut size={16} />
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
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </motion.button>

          <motion.button
            className="hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
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
            <LanguageSelector />
            <motion.button
              className="mobile-logout-btn"
              onClick={handleLogout}
              whileTap={{ scale: 0.95 }}
            >
              <FiLogOut size={18} />
              {t("navbar.logout")}
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
