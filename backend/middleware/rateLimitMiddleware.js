/**
 * Rate limiting middleware for Express
 * Protects API endpoints from abuse and ensures consistent performance
 */

const rateLimit = require('express-rate-limit');

/**
 * Create a rate limiter middleware with default settings
 * @param {Object} options - Rate limiter options
 * @returns {Function} Express middleware function
 */
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
      status: 'error',
      message: 'Too many requests, please try again later.'
    }
  };

  return rateLimit({
    ...defaultOptions,
    ...options
  });
};

// General API rate limiter
const apiLimiter = createRateLimiter();

// More strict rate limiter for authentication endpoints
const authLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later.'
  }
});

// Rate limiter for CV analysis (resource-intensive operations)
const cvAnalysisLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Increased from 5 to 20 CV analyses per hour
  message: {
    status: 'error',
    message: 'You have reached the maximum number of CV analyses per hour. Please try again later.'
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  cvAnalysisLimiter,
  createRateLimiter
};
