/**
 * Analysis persistence helpers.
 *
 * Stores the full /analyze payload (as JSON) per user so the dashboard can be
 * reloaded without re-running OpenAI, and so later features (discovery, roadmaps)
 * can build on a saved analysis.
 */
const { prisma } = require('./client');
const { getOrCreateUser } = require('./users');

/**
 * Save a CV analysis for a user (creates the User row if needed).
 * @param {string} clerkUserId
 * @param {object} payload - the full analysis object returned to the client
 * @returns {Promise<import('@prisma/client').Analysis>}
 */
async function saveAnalysis(clerkUserId, payload) {
  const user = await getOrCreateUser(clerkUserId);
  return prisma.analysis.create({
    data: { userId: user.id, payload },
  });
}

/**
 * Get a user's most recent analysis payload, or null if none / unknown user.
 * @param {string} clerkUserId
 * @returns {Promise<object|null>}
 */
async function getLatestAnalysis(clerkUserId) {
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) return null;
  const latest = await prisma.analysis.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  return latest ? latest.payload : null;
}

module.exports = { saveAnalysis, getLatestAnalysis };
