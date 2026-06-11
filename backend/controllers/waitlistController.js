/**
 * Waitlist controller.
 *
 * Public "stay updated" email capture from the landing page. Idempotent: a
 * repeat email is a successful no-op (the db helper upserts on the unique
 * email). Fire-and-forget notification, same as the feedback controller.
 */
const { getRequestUserId } = require('../middleware/authMiddleware');
const { ValidationError } = require('../utils/errors');
const { addWaitlistEntry } = require('../db/waitlist');
const { sendNotification } = require('../services/emailService');

const MAX_SHORT = 200;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanString(value, max) {
  const str = typeof value === 'string' ? value.trim() : '';
  return str.slice(0, max);
}

/**
 * POST /api/waitlist — join the "stay updated" list.
 */
exports.join = async (req, res, next) => {
  try {
    // Honeypot: bots fill the hidden `company` field. Accept silently, don't store.
    const honeypot = req.body?.company;
    if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
      return res.status(201).json({ status: 'success' });
    }

    const email = cleanString(req.body?.email, MAX_SHORT).toLowerCase();
    if (!email || !EMAIL_RE.test(email)) {
      throw new ValidationError('Invalid email', 'Please enter a valid email address.');
    }
    const source = cleanString(req.body?.source, MAX_SHORT) || null;
    const clerkUserId = getRequestUserId(req);

    await addWaitlistEntry({ email, source, clerkUserId });

    sendNotification({
      subject: 'CareerSense waitlist signup',
      text: `${email}\n\nSource: ${source || 'n/a'}\nUser: ${clerkUserId || 'signed out'}`,
      replyTo: email,
    }).catch((err) => console.error('Waitlist notification failed:', err.message));

    return res.status(201).json({ status: 'success' });
  } catch (error) {
    next(error);
  }
};
