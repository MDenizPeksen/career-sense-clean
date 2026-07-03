// Startup environment validation.
//
// Motivation: past sessions repeatedly lost time to env problems the app never
// surfaced clearly — a DATABASE_URL pasted with surrounding quotes, a missing
// DATABASE_URL in render.yaml, CLERK_SECRET_KEY absent while auth was enabled.
// This module normalizes common paste mistakes and fails fast with an
// actionable message instead of a deep stack trace later.

// Env vars whose values are frequently pasted with surrounding quotes (e.g.
// DATABASE_URL="postgres://..."). dotenv keeps those quotes verbatim, which then
// breaks the consumer. Strip a single matching pair of wrapping quotes.
const QUOTED_VALUE_VARS = [
  'DATABASE_URL',
  'OPENAI_API_KEY',
  'CLERK_SECRET_KEY',
  'ONET_API_KEY',
  'ALLOWED_ORIGINS',
];

const stripWrappingQuotes = (value) => {
  const trimmed = value.trim();
  if (trimmed.length >= 2) {
    const first = trimmed[0];
    const last = trimmed[trimmed.length - 1];
    if ((first === '"' || first === "'") && first === last) {
      return trimmed.slice(1, -1);
    }
  }
  return trimmed;
};

/**
 * Normalize known env vars in place and validate required ones for the current
 * NODE_ENV. Exits the process with code 1 on a fatal misconfiguration.
 *
 * @param {NodeJS.ProcessEnv} [env=process.env]
 * @returns {{ warnings: string[] }}
 */
const validateEnv = (env = process.env) => {
  // 1. Normalize: trim and de-quote the vars that are commonly mis-pasted.
  for (const key of QUOTED_VALUE_VARS) {
    if (typeof env[key] === 'string') {
      env[key] = stripWrappingQuotes(env[key]);
    }
  }

  const isProduction = env.NODE_ENV === 'production';
  // Auth defaults ON unless explicitly disabled (matches authMiddleware).
  const authEnabled = env.AUTH_ENABLED !== 'false';

  const fatal = [];
  const warnings = [];

  // 2. Always required — the app cannot analyze a CV without it.
  if (!env.OPENAI_API_KEY) {
    fatal.push(
      'OPENAI_API_KEY is not set. Add it to backend/.env (get one at ' +
        'https://platform.openai.com/api-keys).'
    );
  }

  // 3. DATABASE_URL — required in production (fatal), warned in dev so the
    // upload→dashboard flow can still be exercised without a DB.
  if (!env.DATABASE_URL) {
    const msg =
      'DATABASE_URL is not set — Prisma-backed features (saved analyses, ' +
      'discovery, career paths) will fail.';
    if (isProduction) {
      fatal.push(msg + ' It is required in production.');
    } else {
      warnings.push(msg);
    }
  }

  // 4. CLERK_SECRET_KEY — required in production when auth is enabled; without
  // it protected routes fail closed (503). Warn in dev.
  if (authEnabled && !env.CLERK_SECRET_KEY) {
    const msg =
      'CLERK_SECRET_KEY is not set while AUTH_ENABLED is not "false".';
    if (isProduction) {
      fatal.push(
        msg + ' Protected routes will return 503 in production. Set the key or ' +
          'set AUTH_ENABLED=false for an intentionally open deployment.'
      );
    } else {
      warnings.push(msg + ' Protected routes are open in dev with a warning.');
    }
  }

  if (warnings.length) {
    console.warn('\n⚠️  Environment warnings:');
    warnings.forEach((w) => console.warn(`   - ${w}`));
  }

  if (fatal.length) {
    console.error('\n❌ Fatal environment errors:');
    fatal.forEach((f) => console.error(`   - ${f}`));
    console.error('');
    process.exit(1);
  }

  return { warnings };
};

module.exports = { validateEnv, stripWrappingQuotes };
