import React, { createContext, useState, useContext, useEffect } from 'react';
import enTranslations from '../i18n/en.json';
import knTranslations from '../i18n/kn.json';
import hiTranslations from '../i18n/hi.json';
import teTranslations from '../i18n/te.json';
import taTranslations from '../i18n/ta.json';
import mlTranslations from '../i18n/ml.json';
import mrTranslations from '../i18n/mr.json';

const LanguageContext = createContext();

const translations = {
  en: enTranslations,
  kn: knTranslations,
  hi: hiTranslations,
  te: teTranslations,
  ta: taTranslations,
  ml: mlTranslations,
  mr: mrTranslations
};

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' }
];

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Load from localStorage if available
    return localStorage.getItem('language') || 'en';
  });

  const [darkMode, setDarkMode] = useState(() => {
    // Load from localStorage if available
    return localStorage.getItem('darkMode') === 'true' || false;
  });

  // Save to localStorage whenever language changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Save to localStorage whenever dark mode changes
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    // Apply dark mode to document
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];

    for (let k of keys) {
      value = value?.[k];
    }

    if (value !== undefined && value !== null) {
      return value;
    }

    // Fall back to English
    let enValue = translations['en'];
    for (let k of keys) {
      enValue = enValue?.[k];
    }

    return enValue || key;
  };

  const switchLanguage = (lang) => {
    if (SUPPORTED_LANGUAGES.find(l => l.code === lang)) {
      setLanguage(lang);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        t,
        switchLanguage,
        SUPPORTED_LANGUAGES,
        darkMode,
        setDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
