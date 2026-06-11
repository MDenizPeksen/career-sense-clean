/**
 * Express app factory.
 *
 * Builds and returns the configured app WITHOUT starting a listener, so it can
 * be mounted directly in tests (supertest) as well as by the runtime entry
 * (`index.js`, which handles clustering + `listen`).
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');

// Configuration
const serverConfig = require('./config/server');

// Middleware
const logger = require('./middleware/loggerMiddleware');
const errorHandler = require('./middleware/errorHandler');
const compressionMiddleware = require('./middleware/compressionMiddleware');
const { cacheMiddleware } = require('./middleware/cacheMiddleware');
const { apiLimiter, cvAnalysisLimiter, createEngagementLimiter } = require('./middleware/rateLimitMiddleware');
const { isClerkConfigured } = require('./middleware/authMiddleware');
const { clerkMiddleware } = require('@clerk/express');

// Routes
const routes = require('./routes');

/**
 * Construct the Express application with all middleware and routes wired up.
 * @returns {import('express').Express}
 */
function createApp() {
  const app = express();

  // Trust the first proxy (Render/Railway/Nginx) so client IPs and
  // rate limiting work correctly behind a load balancer.
  app.set('trust proxy', 1);

  // Security middleware
  app.use(helmet());

  // Compression middleware to reduce response size
  app.use(compressionMiddleware);

  // Request logging middleware
  app.use(logger);

  // CORS configuration
  app.use(cors(serverConfig.cors));

  // Body parser middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Clerk auth context (only when configured — keeps local dev runnable
  // without Clerk keys). requireAuth() on protected routes reads this.
  if (isClerkConfigured()) {
    app.use(clerkMiddleware());
  }

  // Apply rate limiting to all API routes
  app.use('/api', apiLimiter);

  // Apply stricter rate limiting to resource-intensive endpoints
  app.use('/analyze', cvAnalysisLimiter);
  app.use('/api/archetype', cvAnalysisLimiter);

  // Strict limiting on unauthenticated write endpoints (anti-spam). Each gets
  // its own limiter instance so the per-IP budget is independent per endpoint.
  app.use('/api/feedback', createEngagementLimiter());
  app.use('/api/contact', createEngagementLimiter());
  app.use('/api/waitlist', createEngagementLimiter());

  // Apply caching to GET requests
  app.use('/api', cacheMiddleware(300)); // 5 minutes cache for API endpoints

  // Static file serving with cache control
  app.use('/static', express.static(path.join(__dirname, 'public'), {
    maxAge: '1d', // Cache static assets for 1 day
    etag: true,
    lastModified: true
  }));

  // Serve SVG files directly from the img/svg directory
  app.use('/img/svg', express.static(path.join(__dirname, 'public/img/svg'), {
    maxAge: '1d',
    etag: true,
    lastModified: true
  }));

  // Serve font files directly from the fonts directory
  app.use('/fonts', express.static(path.join(__dirname, 'public/fonts'), {
    maxAge: '7d', // Cache fonts for 7 days
    etag: true,
    lastModified: true
  }));

  // Register all routes
  app.use('/', routes);

  // Error handling middleware
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
