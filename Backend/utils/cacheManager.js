// Cache Manager for Backend Services
class CacheManager {
  constructor(defaultTTL = 3600000) { // 1 hour default
    this.cache = new Map();
    this.ttl = new Map();
    this.defaultTTL = defaultTTL;
  }

  set(key, value, ttl = this.defaultTTL) {
    this.cache.set(key, value);
    
    // Clear existing timeout if any
    if (this.ttl.has(key)) {
      clearTimeout(this.ttl.get(key));
    }

    // Set new timeout for expiration
    const timeout = setTimeout(() => {
      this.cache.delete(key);
      this.ttl.delete(key);
    }, ttl);

    this.ttl.set(key, timeout);
  }

  get(key) {
    return this.cache.get(key);
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    if (this.ttl.has(key)) {
      clearTimeout(this.ttl.get(key));
      this.ttl.delete(key);
    }
    this.cache.delete(key);
  }

  clear() {
    this.ttl.forEach(timeout => clearTimeout(timeout));
    this.cache.clear();
    this.ttl.clear();
  }

  size() {
    return this.cache.size;
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

module.exports = cacheManager;
