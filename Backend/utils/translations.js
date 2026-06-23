// Backend translations for server-side AI responses
const translations = {
  en: {
    cropRecommendation: "Crop Recommendation",
    fertilizerSuggestion: "Fertilizer Suggestion",
    irrigationAdvisory: "Irrigation Advisory",
    pestAlert: "Pest Alert",
    yieldPrediction: "Yield Prediction",
    profitEstimation: "Profit Estimation",
    diseaseDetection: "Disease Detection",
    error: "An error occurred while processing your request",
    noProfile: "Farmer profile not found. Please create one first.",
  },
  kn: {
    cropRecommendation: "ಬೆಳೆ ಸಿಫಾರಿಶು",
    fertilizerSuggestion: "ರಾಸಾಯನಿಕ ಸಾರ ಸಿಫಾರಿಶು",
    irrigationAdvisory: "ನೀರಾವರಣ ಸಲಹೆ",
    pestAlert: "ಕೀಟ ಎಚ್ಚರಿಕೆ",
    yieldPrediction: "ಫಸಲು ಮುನ್ನುಸೂಚನೆ",
    profitEstimation: "ಲಾಭ ಅಂದಾಜು",
    diseaseDetection: "ರೋಗ ಗುರುತಿಸುವಿಕೆ",
    error: "ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಪ್ರಕ್ರಿಯೆ ಮಾಡುವಾಗ ದೋಷ ಸಂಭವಿಸಿದೆ",
    noProfile: "ರೈತ ಪ್ರೊಫೈಲ್ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೊದಲು ಒಂದನ್ನು ರಚಿಸಿ.",
  },
  hi: {
    cropRecommendation: "फसल सिफारिश",
    fertilizerSuggestion: "खाद सुझाव",
    irrigationAdvisory: "सिंचाई सलाह",
    pestAlert: "कीट अलर्ट",
    yieldPrediction: "पैदावार पूर्वानुमान",
    profitEstimation: "लाभ अनुमान",
    diseaseDetection: "रोग पहचान",
    error: "आपके अनुरोध को संसाधित करते समय त्रुटि हुई",
    noProfile: "किसान प्रोफाइल नहीं मिला। कृपया पहले एक बनाएं।",
  },
  te: {
    cropRecommendation: "పంటల సిఫారిశ్లు",
    fertilizerSuggestion: "సారవంతమైన సూచన",
    irrigationAdvisory: "నీటిపారుదల సలహా",
    pestAlert: "క్రిమి హెచ్చరిక",
    yieldPrediction: "పంట సూచన",
    profitEstimation: "లాభ అంచనా",
    diseaseDetection: "వ్యాధి గుర్తింపు",
    error: "మీ అభ్యర్థనను ప్రక్రియ చేస్తున్నప్పుడు లోపం",
    noProfile: "రైతు ప్రొఫైల్ కనుగొనబడలేదు. దయచేసి మొదట ఒకటి సృష్టించండి.",
  },
  ta: {
    cropRecommendation: "பயிர் பரிந்துரைகள்",
    fertilizerSuggestion: "உரம் பரிந்துரைகள்",
    irrigationAdvisory: "பாசனம் ஆலோசனை",
    pestAlert: "பூச்சி எச்சரிக்கை",
    yieldPrediction: "மகசூல் முன்னறிவிப்பு",
    profitEstimation: "லாபம் மதிப்பீடு",
    diseaseDetection: "நோய் கண்டறிதல்",
    error: "உங்கள் கோரிக்கையைச் செயல்படுத்துவதில் பிழை",
    noProfile: "விவசாயி சுயவிவரம் கண்டுபிடிக்கப்படவில்லை. முதலில் ஒன்றை உருவாக்கவும்.",
  },
  ml: {
    cropRecommendation: "ഫസല് ശുപാരിശകൾ",
    fertilizerSuggestion: "വളം നിർദ്ദേശങ്ങൾ",
    irrigationAdvisory: "സേചന ഉപദേശം",
    pestAlert: "കീടാപ്രവിജ്ഞാനം",
    yieldPrediction: "വിളവ് പ്രവചനം",
    profitEstimation: "മുനാഫ ആകലനം",
    diseaseDetection: "രോഗ സംജ്ഞാനം",
    error: "നിങ്ങളുടെ അഭ്യർത്ഥനം പ്രക്രിയ ചെയ്യുന്നതിൽ ലോപം സംഭവിച്ചു",
    noProfile: "കർഷക പ്രൊഫൈൽ കണ്ടെത്താനായില്ല. ദയവായി ആദ്യം ഒന്ന് സൃഷ്ടിക്കുക.",
  },
  mr: {
    cropRecommendation: "पीक सुझाव",
    fertilizerSuggestion: "खतीचे सुझाव",
    irrigationAdvisory: "सिंचाई सल्ला",
    pestAlert: "कीटक सतर्कता",
    yieldPrediction: "उपज अंदाज",
    profitEstimation: "नफा अंदाज",
    diseaseDetection: "रोग शोध",
    error: "आपल्या विनंतीचे प्रक्रिया करताना त्रुटी",
    noProfile: "शेतकरी प्रोफाइल सापडला नाही. कृपया प्रथम एक तयार करा.",
  }
};

// Get translation for a key in a specific language
const getTranslation = (language = 'en', key) => {
  return translations[language]?.[key] || translations['en']?.[key] || key;
};

// Get all translations for a language
const getLanguageTranslations = (language = 'en') => {
  return translations[language] || translations['en'];
};

module.exports = {
  translations,
  getTranslation,
  getLanguageTranslations
};
