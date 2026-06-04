/**
 * Response caching middleware for Express
 * Caches API responses to reduce processing time and database load
 */

const NodeCache = require('node-cache');

// Create cache instance with default TTL of 5 minutes and check period of 10 minutes
const apiCache = new NodeCache({ 
  stdTTL: 300, // 5 minutes in seconds
  checkperiod: 600 // 10 minutes in seconds
});

/**
 * Middleware factory that creates caching middleware
 * @param {number} duration - Cache duration in seconds
 * @param {Function} keyGenerator - Optional function to generate custom cache keys
 * @returns {Function} Express middleware function
 */
const cacheMiddleware = (duration = 300, keyGenerator = null) => {
  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Never share a cached response across authenticated requests. The default
    // cache key is the URL only, so user-scoped endpoints (e.g.
    // /api/discovery/sessions/latest) would otherwise serve one user's data to
    // another. A custom keyGenerator can opt back in to per-user caching.
    if (!keyGenerator && req.headers.authorization) {
      return next();
    }

    // Generate cache key
    const key = keyGenerator ?
      keyGenerator(req) :
      `${req.originalUrl || req.url}`;

    // Check if we have a cache hit
    const cachedResponse = apiCache.get(key);
    
    if (cachedResponse) {
      // Return cached response
      res.set('X-Cache', 'HIT');
      return res.status(200).send(cachedResponse);
    }

    // Store the original send function
    const originalSend = res.send;

    // Override the send function
    res.send = function(body) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        apiCache.set(key, body, duration);
      }
      
      // Set cache header
      res.set('X-Cache', 'MISS');
      
      // Call the original send function
      return originalSend.call(this, body);
    };

    next();
  };
};

/**
 * Clear the entire cache or a specific key
 * @param {string} key - Optional specific cache key to clear
 */
const clearCache = (key = null) => {
  if (key) {
    apiCache.del(key);
  } else {
    apiCache.flushAll();
  }
};

module.exports = {
  cacheMiddleware,
  clearCache
};
