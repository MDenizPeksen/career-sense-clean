/**
 * Waitlist persistence helpers.
 *
 * A WaitlistEntry is a "stay updated" email capture from the landing page. Email
 * is unique, so a repeat signup is an idempotent no-op (upsert) rather than a
 * duplicate row or a 500. These are public submissions; `clerkUserId` is stored
 * when the submitter happens to be signed in.
 */
const { prisma } = require('./client');

/**
 * Add an email to the waitlist, or no-op if it's already present.
 * @param {{ email: string, source?: string|null, clerkUserId?: string|null }} input
 * @returns {Promise<import('@prisma/client').WaitlistEntry>}
 */
async function addWaitlistEntry({ email, source, clerkUserId }) {
  return prisma.waitlistEntry.upsert({
    where: { email },
    update: {}, // already on the list → no-op
    create: {
      email,
      source: source || null,
      clerkUserId: clerkUserId || null,
    },
  });
}

module.exports = { addWaitlistEntry };
