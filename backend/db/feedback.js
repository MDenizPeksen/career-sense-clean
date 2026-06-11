/**
 * Feedback persistence helpers.
 *
 * A Feedback row is an inbound message from either the floating feedback widget
 * (`type: 'feedback'`) or the contact page (`type: 'contact'`). These are public
 * submissions — anonymous visitors can send them — so there is no ownership
 * scoping here; `clerkUserId` is stored as a plain optional string when the
 * submitter happens to be signed in.
 */
const { prisma } = require('./client');

/**
 * Persist a feedback/contact submission.
 * @param {{ type: 'feedback'|'contact', message: string, email?: string|null,
 *           name?: string|null, clerkUserId?: string|null, pageUrl?: string|null }} input
 * @returns {Promise<import('@prisma/client').Feedback>}
 */
async function addFeedback({ type, message, email, name, clerkUserId, pageUrl }) {
  return prisma.feedback.create({
    data: {
      type,
      message,
      email: email || null,
      name: name || null,
      clerkUserId: clerkUserId || null,
      pageUrl: pageUrl || null,
    },
  });
}

module.exports = { addFeedback };
