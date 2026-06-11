/**
 * Feedback / contact controller.
 *
 * Two public entry points that share one data shape and one notification path:
 *   - submitFeedback: the floating in-app feedback widget (type 'feedback')
 *   - submitContact:  the contact page form (type 'contact')
 *
 * Both are public (no requireAuth) but call getRequestUserId so a signed-in
 * submitter is attributed. Validation is inline (matching discoveryController).
 * The Resend notification is fire-and-forget so a mail failure never breaks the
 * user's submission.
 */
const { getRequestUserId } = require('../middleware/authMiddleware');
const { ValidationError } = require('../utils/errors');
const { addFeedback } = require('../db/feedback');
const { sendNotification } = require('../services/emailService');

const MAX_MESSAGE = 4000;
const MAX_SHORT = 200;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A hidden form field bots tend to fill. Real users leave it empty.
function isBot(req) {
  const honeypot = req.body?.company;
  return typeof honeypot === 'string' && honeypot.trim().length > 0;
}

function cleanString(value, max) {
  const str = typeof value === 'string' ? value.trim() : '';
  return str.slice(0, max);
}

function validateEmail(value, { required }) {
  const email = cleanString(value, MAX_SHORT);
  if (!email) {
    if (required) throw new ValidationError('Email is required', 'Please enter your email address.');
    return null;
  }
  if (!EMAIL_RE.test(email)) {
    throw new ValidationError('Invalid email', 'Please enter a valid email address.');
  }
  return email;
}

// Quietly accept bot submissions so scrapers get no signal, but never persist.
function acceptedResponse(res) {
  return res.status(201).json({ status: 'success' });
}

/**
 * POST /api/feedback — floating widget. Message required; email optional.
 */
exports.submitFeedback = async (req, res, next) => {
  try {
    if (isBot(req)) return acceptedResponse(res);

    const message = cleanString(req.body?.message, MAX_MESSAGE);
    if (!message) {
      throw new ValidationError('Message is required', 'Please tell us a little about it.');
    }
    const email = validateEmail(req.body?.email, { required: false });
    const category = cleanString(req.body?.category, MAX_SHORT) || null;
    const pageUrl = cleanString(req.body?.pageUrl, MAX_SHORT) || null;
    const clerkUserId = getRequestUserId(req);

    // Prefix the message with the category (Bug/Idea/Other) for at-a-glance triage.
    const storedMessage = category ? `[${category}] ${message}` : message;

    await addFeedback({ type: 'feedback', message: storedMessage, email, clerkUserId, pageUrl });

    sendNotification({
      subject: `CareerSense feedback${category ? ` · ${category}` : ''}`,
      text: `${storedMessage}\n\nFrom: ${email || 'anonymous'}\nUser: ${clerkUserId || 'signed out'}\nPage: ${pageUrl || 'n/a'}`,
      replyTo: email || undefined,
    }).catch((err) => console.error('Feedback notification failed:', err.message));

    return res.status(201).json({ status: 'success' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/contact — contact page. Name, email, and message all required.
 */
exports.submitContact = async (req, res, next) => {
  try {
    if (isBot(req)) return acceptedResponse(res);

    const name = cleanString(req.body?.name, MAX_SHORT);
    const message = cleanString(req.body?.message, MAX_MESSAGE);
    if (!message) {
      throw new ValidationError('Message is required', 'Please enter a message.');
    }
    const email = validateEmail(req.body?.email, { required: true });
    const clerkUserId = getRequestUserId(req);

    await addFeedback({ type: 'contact', message, email, name: name || null, clerkUserId });

    sendNotification({
      subject: `CareerSense contact${name ? ` from ${name}` : ''}`,
      text: `${message}\n\nName: ${name || 'n/a'}\nFrom: ${email}\nUser: ${clerkUserId || 'signed out'}`,
      replyTo: email,
    }).catch((err) => console.error('Contact notification failed:', err.message));

    return res.status(201).json({ status: 'success' });
  } catch (error) {
    next(error);
  }
};
