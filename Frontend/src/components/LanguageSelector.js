import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import "../styles/LanguageSelector.css";

const LanguageSelector = () => {
  const { language, switchLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "kn", name: "ಕನ್ನಡ", flag: "🇮🇳" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "te", name: "తెలుగు", flag: "🇮🇳" },
    { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
    { code: "ml", name: "മലയാളം", flag: "🇮🇳" },
    { code: "mr", name: "मराठी", flag: "🇮🇳" },
  ];

  const currentLang = languages.find((l) => l.code === language);

  const handleLanguageChange = (code) => {
    switchLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="language-selector">
      <motion.button
        className="language-button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="flag">{currentLang?.flag}</span>
        <span className="code">{currentLang?.code.toUpperCase()}</span>
        <FiChevronDown
          size={16}
          className={`chevron ${isOpen ? "rotate" : ""}`}
        />
      </motion.button>

      {isOpen && (
        <motion.div
          className="language-dropdown"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {languages.map((lang) => (
            <motion.button
              key={lang.code}
              className={`language-item ${lang.code === language ? "active" : ""}`}
              onClick={() => handleLanguageChange(lang.code)}
              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flag">{lang.flag}</span>
              <span className="name">{lang.name}</span>
              <span className="code">{lang.code.toUpperCase()}</span>
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default LanguageSelector;
