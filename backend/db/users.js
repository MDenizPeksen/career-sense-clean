/**
 * User persistence helpers.
 *
 * Users are identified by their Clerk user id (`clerkUserId`). A local `User` row
 * is created lazily the first time we see an authenticated request, so we never
 * need a Clerk webhook just to have a row to hang user-scoped data off of.
 */
const { prisma } = require('./client');

/**
 * Find or create the local User for a Clerk user id.
 * @param {string} clerkUserId - the verified Clerk user id (req.auth.userId)
 * @param {{ email?: string, name?: string }} [profile] - optional profile fields
 * @returns {Promise<import('@prisma/client').User>}
 */
async function getOrCreateUser(clerkUserId, profile = {}) {
  if (!clerkUserId || typeof clerkUserId !== 'string') {
    throw new Error('getOrCreateUser requires a clerkUserId');
  }
  return prisma.user.upsert({
    where: { clerkUserId },
    update: {},
    create: {
      clerkUserId,
      email: profile.email || null,
      name: profile.name || null,
    },
  });
}

module.exports = { getOrCreateUser };
