import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiAlertTriangle, FiHome, FiRefreshCw } from "react-icons/fi";
import "../styles/ErrorBoundary.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error }) => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div
      className="error-boundary-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="error-content">
        <motion.div
          className="error-icon"
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <FiAlertTriangle size={64} />
        </motion.div>

        <h1 className="error-title">Oops! Something went wrong</h1>

        <p className="error-message">
          We encountered an unexpected error. Don't worry, our team has been
          notified.
        </p>

        {error && process.env.NODE_ENV === "development" && (
          <motion.div
            className="error-details"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ delay: 0.3 }}
          >
            <p className="error-text">{error.toString()}</p>
          </motion.div>
        )}

        <div className="error-actions">
          <motion.button
            className="error-button primary"
            onClick={() => window.location.reload()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiRefreshCw size={18} />
            Try Again
          </motion.button>

          <motion.button
            className="error-button secondary"
            onClick={() => navigate("/dashboard")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiHome size={18} />
            Go to Dashboard
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ErrorBoundary;
