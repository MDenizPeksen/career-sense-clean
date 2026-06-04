/**
 * Authentication middleware (Clerk).
 *
 * Protects the expensive OpenAI-backed routes so anonymous traffic can't
 * run up API costs. Token verification is networkless via @clerk/express.
 *
 * AUTH_ENABLED=false bypasses verification entirely (useful for local testing).
 * Otherwise behavior is driven by CLERK_SECRET_KEY:
 *   - configured        -> verify the request; 401 if not signed in.
 *   - missing + dev      -> allow through with a one-time warning (local DX).
 *   - missing + prod     -> fail closed with 503 (refuse to expose paid routes).
 */

const { getAuth } = require('@clerk/express');

const isAuthEnabled = () => process.env.AUTH_ENABLED !== 'false';
const isClerkConfigured = () => Boolean(process.env.CLERK_SECRET_KEY);

let warnedAboutDisabledAuth = false;
let warnedAboutMissingClerk = false;

const requireAuth = (req, res, next) => {
  if (!isAuthEnabled()) {
    if (!warnedAboutDisabledAuth) {
      console.warn('⚠️  AUTH_ENABLED=false — auth is DISABLED on protected routes (testing mode).');
      warnedAboutDisabledAuth = true;
    }
    return next();
  }

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

// Stable id used for persistence when auth is bypassed locally, so the stateful
// flows (saved analyses, etc.) are testable without a real Clerk session.
const LOCAL_DEV_USER_ID = 'local-dev-user';

/**
 * Resolve the user id to scope persisted data to. Mirrors requireAuth's modes:
 *   - auth disabled                 -> LOCAL_DEV_USER_ID (testing)
 *   - Clerk not configured + dev    -> LOCAL_DEV_USER_ID (open in dev)
 *   - Clerk not configured + prod   -> null (route is already 503'd)
 *   - Clerk configured              -> the verified Clerk user id (or null)
 * Routes using this should sit behind requireAuth.
 * @returns {string|null}
 */
const getRequestUserId = (req) => {
  if (!isAuthEnabled()) return LOCAL_DEV_USER_ID;
  if (!isClerkConfigured()) {
    return process.env.NODE_ENV === 'production' ? null : LOCAL_DEV_USER_ID;
  }
  const { userId } = getAuth(req);
  return userId || null;
};

module.exports = { requireAuth, isClerkConfigured, getRequestUserId };
