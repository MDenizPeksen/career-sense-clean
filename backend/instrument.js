/**
 * Sentry initialization.
 *
 * Required as the VERY FIRST thing in index.js so Sentry can auto-instrument
 * http/express before they're loaded. Fail-soft: when SENTRY_DSN is unset (local
 * dev, or before you've created a Sentry project) this is a no-op and the rest
 * of the error-capture code (Sentry.captureException in errorHandler) silently
 * does nothing — same pattern as the optional email/Clerk config.
 */
const Sentry = require('@sentry/node');

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    // Error monitoring only by default — keep performance tracing off to avoid
    // overhead/cost. Raise this if you want latency traces later.
    tracesSampleRate: 0,
  });
  console.log('🛰️  Sentry error monitoring enabled.');
}

module.exports = Sentry;
