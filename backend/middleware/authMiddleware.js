/**
 * Authentication middleware (Clerk).
 *
 * Protects the expensive OpenAI-backed routes so anonymous traffic can't
 * run up API costs. Token verification is networkless via @clerk/express.
 *
 * Configuration is driven by CLERK_SECRET_KEY:
 *   - configured        -> verify the request; 401 if not signed in.
 *   - missing + dev      -> allow through with a one-time warning (local DX).
 *   - missing + prod     -> fail closed with 503 (refuse to expose paid routes).
 */

const { getAuth } = require('@clerk/express');

const isClerkConfigured = () => Boolean(process.env.CLERK_SECRET_KEY);

let warnedAboutMissingClerk = false;

const requireAuth = (req, res, next) => {
  if (!isClerkConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({
        status: 'error',
        message: 'Authentication is not configured on the server.'
      });
    }
    if (!warnedAboutMissingClerk) {
      console.warn(
        '⚠️  CLERK_SECRET_KEY not set — protected routes are OPEN in development. ' +
        'Set Clerk keys before deploying to production.'
      );
      warnedAboutMissingClerk = true;
    }
    return next();
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required. Please sign in.'
    });
  }

  return next();
};

module.exports = { requireAuth, isClerkConfigured };
