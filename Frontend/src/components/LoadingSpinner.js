import React from "react";
import { motion } from "framer-motion";
import "../styles/LoadingSpinner.css";

const LoadingSpinner = ({ fullPage = false, message = "Loading..." }) => {
  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  if (fullPage) {
    return (
      <motion.div
        className="loading-overlay"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="loading-container">
          <motion.div
            className="spinner"
            variants={spinnerVariants}
            animate="animate"
          >
            <div className="spinner-inner" />
          </motion.div>
          <motion.p
            className="loading-message"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {message}
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="loading-inline"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="spinner-small"
        variants={spinnerVariants}
        animate="animate"
      >
        <div className="spinner-inner-small" />
      </motion.div>
      {message && <span className="inline-message">{message}</span>}
    </motion.div>
  );
};

export default LoadingSpinner;
