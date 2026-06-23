// Input Validation Utilities
const validator = {
  // Email validation
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Phone validation (Indian format)
  isValidPhone: (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile numbers
    return phoneRegex.test(phone.replace(/\D/g, ''));
  },

  // Farm size validation
  isValidFarmSize: (size) => {
    const numSize = parseFloat(size);
    return !isNaN(numSize) && numSize > 0 && numSize <= 10000;
  },

  // Year validation (for crop years)
  isValidYear: (year) => {
    const numYear = parseInt(year);
    const currentYear = new Date().getFullYear();
    return !isNaN(numYear) && numYear >= 1950 && numYear <= currentYear + 1;
  },

  // Month validation (1-12)
  isValidMonth: (month) => {
    const numMonth = parseInt(month);
    return !isNaN(numMonth) && numMonth >= 1 && numMonth <= 12;
  },

  // District validation
  isValidDistrict: (district) => {
    return typeof district === 'string' && district.trim().length > 0;
  },

  // State validation
  isValidState: (state) => {
    return typeof state === 'string' && state.trim().length > 0;
  },

  // Language validation
  isValidLanguage: (language) => {
    const supportedLanguages = ['en', 'kn', 'hi', 'te', 'ta', 'ml', 'mr'];
    return supportedLanguages.includes(language);
  },

  // Soil type validation
  isValidSoilType: (soilType) => {
    const validTypes = ['Black Soil', 'Red Soil', 'Laterite Soil', 'Alluvial Soil', 'Clay Soil', 'Sandy Soil'];
    return validTypes.includes(soilType);
  },

  // Crop validation
  isValidCrop: (crop) => {
    return typeof crop === 'string' && crop.trim().length > 0 && crop.trim().length <= 50;
  },

  // Generic string validation
  isValidString: (str, minLen = 1, maxLen = 255) => {
    return typeof str === 'string' && str.trim().length >= minLen && str.trim().length <= maxLen;
  },

  // Array validation
  isValidArray: (arr, minLen = 1, maxLen = 100) => {
    return Array.isArray(arr) && arr.length >= minLen && arr.length <= maxLen;
  },

  // Temperature validation
  isValidTemperature: (temp) => {
    const numTemp = parseFloat(temp);
    return !isNaN(numTemp) && numTemp >= -50 && numTemp <= 60;
  },

  // Humidity validation (0-100)
  isValidHumidity: (humidity) => {
    const numHumidity = parseFloat(humidity);
    return !isNaN(numHumidity) && numHumidity >= 0 && numHumidity <= 100;
  },

  // Price validation
  isValidPrice: (price) => {
    const numPrice = parseFloat(price);
    return !isNaN(numPrice) && numPrice >= 0 && numPrice <= 1000000;
  }
};

module.exports = validator;
