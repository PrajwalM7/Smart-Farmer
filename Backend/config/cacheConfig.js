// Central cache configuration for backend services
const DEFAULT_TTL = 60 * 60 * 1000; // 1 hour default TTL in milliseconds

/**
 * Generate a cache key based on provided identifiers.
 * Accepts any number of string arguments and concatenates them
 * with underscores after converting to lower case and trimming.
 * Example: getCacheKey('Karnataka', 'Mysuru', 'Rice') -> 'karnataka_mysuru_rice'
 */
function getCacheKey(...parts) {
  return parts
    .filter(Boolean)
    .map((p) => String(p).trim().toLowerCase())
    .join('_');
}

module.exports = {
  DEFAULT_TTL,
  getCacheKey,
};
