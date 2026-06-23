// Response Formatter Utilities
const responseFormatter = {
  // Standard success response
  success: (data = null, message = 'Request successful') => {
    return {
      success: true,
      message,
      ...(data && { data })
    };
  },

  // Standard paginated response
  paginated: (data, page, limit, total, message = 'Data retrieved successfully') => {
    return {
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  // Error response
  error: (message = 'An error occurred', statusCode = 500, details = null) => {
    return {
      success: false,
      statusCode,
      message,
      ...(details && { details })
    };
  },

  // Recommendation response
  recommendation: (recommendations, type = 'crop', message = 'Recommendations generated') => {
    return {
      success: true,
      message,
      type,
      recommendations
    };
  },

  // Advisory response
  advisory: (advisory, type = 'irrigation', message = 'Advisory generated') => {
    return {
      success: true,
      message,
      type,
      advisory
    };
  },

  // Alert response
  alert: (alert, type = 'pest', level = 'medium', message = 'Alert generated') => {
    return {
      success: true,
      message,
      type,
      level,
      alert
    };
  },

  // Prediction response
  prediction: (prediction, type = 'yield', confidence = 0, message = 'Prediction generated') => {
    return {
      success: true,
      message,
      type,
      confidence,
      prediction
    };
  },

  // Multi-language response
  localized: (data, language = 'en', message = 'Data retrieved') => {
    return {
      success: true,
      message,
      language,
      data
    };
  }
};

module.exports = responseFormatter;
