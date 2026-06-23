
// utils/errorHandler.js

class APIError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Standard error responses
const errorHandler = {
  // 400 - Bad Request
  badRequest: (message = "Bad Request", details = null) => {
    throw new APIError(400, message, details);
  },

  // 401 - Unauthorized
  unauthorized: (message = "Unauthorized Access", details = null) => {
    throw new APIError(401, message, details);
  },

  // 403 - Forbidden
  forbidden: (message = "Access Forbidden", details = null) => {
    throw new APIError(403, message, details);
  },

  // 404 - Not Found
  notFound: (message = "Resource Not Found", details = null) => {
    throw new APIError(404, message, details);
  },

  // 409 - Conflict
  conflict: (message = "Resource Conflict", details = null) => {
    throw new APIError(409, message, details);
  },

  // 422 - Unprocessable Entity
  unprocessableEntity: (message = "Unprocessable Entity", details = null) => {
    throw new APIError(422, message, details);
  },

  // 500 - Internal Server Error
  internalError: (message = "Internal Server Error", details = null) => {
    throw new APIError(500, message, details);
  },

  // 503 - Service Unavailable
  serviceUnavailable: (message = "Service Unavailable", details = null) => {
    throw new APIError(503, message, details);
  }
};

// Global Error Middleware
const errorMiddleware = (err, req, res, next) => {
  console.error("========== FULL ERROR ==========");
  console.error(err);
  console.error("================================");

  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details && { details: err.details }),
      ...(process.env.NODE_ENV === "development" && {
        stack: err.stack
      })
    });
  }

  return res.status(500).json({
    success: false,
    message: err.message || "An unexpected error occurred",
    errorType: err.name || "UnknownError",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      fullError: err.toString()
    })
  });
};

module.exports = {
  APIError,
  errorHandler,
  errorMiddleware
};

