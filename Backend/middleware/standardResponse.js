// middleware/standardResponse.js
// Centralised response formatter for all routes
// Ensures a consistent shape: { success: boolean, data: any, message?: string }

module.exports = {
  success: (res, data, message = "Operation successful") => {
    return res.json({ success: true, data, message });
  },
  error: (res, message = "An error occurred", status = 500) => {
    return res.status(status).json({ success: false, message });
  }
};
