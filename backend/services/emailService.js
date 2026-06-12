/**
 * Email notification service (Resend).
 *
 * Used to ping the operator's inbox when a new feedback/contact/waitlist entry
 * arrives. Intentionally minimal: one outbound notification helper.
 *
 * Configuration is optional so local dev runs without an email provider — the
 * same fail-soft approach the auth middleware takes when Clerk keys are missing:
 *   - RESEND_API_KEY unset  -> log a warning once and no-op (returns false).
 *   - configured            -> send via Resend.
 *
 * Callers should treat sending as fire-and-forget: a delivery failure must never
 * break the user-facing request (mirrors how cvController persists analyses with
 * `.catch(...)`).
 */
const { Resend } = require('resend');

const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const NOTIFY_EMAIL = process.env.FEEDBACK_NOTIFY_EMAIL;

let resendClient = null;
let warnedAboutMissingKey = false;

function getClient() {
  if (resendClient) return resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  resendClient = new Resend(apiKey);
  return resendClient;
}

/**
 * Send a plain-text notification to the operator inbox.
 * @param {{ subject: string, text: string, replyTo?: string }} input
 * @returns {Promise<boolean>} true if a send was attempted, false if no-op'd.
 */
async function sendNotification({ subject, text, replyTo }) {
  const client = getClient();
  if (!client || !NOTIFY_EMAIL) {
    if (!warnedAboutMissingKey) {
      console.warn(
        '✉️  Email notifications disabled — set RESEND_API_KEY and FEEDBACK_NOTIFY_EMAIL to enable.'
      );
      warnedAboutMissingKey = true;
    }
    return false;
  }

  await client.emails.send({
    from: FROM_EMAIL,
    to: NOTIFY_EMAIL,
    subject,
    text,
    ...(replyTo ? { replyTo } : {}),
  });
  return true;
}

module.exports = { sendNotification };
