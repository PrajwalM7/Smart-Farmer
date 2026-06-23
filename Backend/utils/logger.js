// Simple Logger Utility
const logger = {
  // INFO level
  info: (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },

  // ERROR level
  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`);
    if (error) {
      console.error(error);
    }
  },

  // WARNING level
  warn: (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARN: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },

  // DEBUG level
  debug: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] DEBUG: ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  },

  // API request logging
  apiRequest: (method, path, statusCode, duration) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${method} ${path} - ${statusCode} (${duration}ms)`);
  },

  // API error logging
  apiError: (method, path, statusCode, error) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ${method} ${path} - ${statusCode}:`, error.message);
  }
};

module.exports = logger;
