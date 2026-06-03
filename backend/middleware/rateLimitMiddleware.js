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
const int = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: int(process.env.RATE_LIMIT_WINDOW_MS, 60 * 60 * 1000), // default 1 hour
    max: int(process.env.RATE_LIMIT_MAX_REQUESTS, 100), // requests per window per IP
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
  max: int(process.env.CV_ANALYSIS_RATE_LIMIT, 20), // CV analyses per hour per IP
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
