/**
 * Discovery-session persistence helpers.
 *
 * A DiscoverySession is a multi-turn conversation that enriches a user's profile
 * beyond their CV (goals, constraints, target industries, timeline, etc.). Each
 * session owns an ordered list of Messages (user/assistant). When the agent has
 * gathered enough, the session is marked `completed` and an `enrichedProfile`
 * JSON blob is stored.
 *
 * All reads are scoped to the owning user so one user can never touch another's
 * session, even with a guessed session id.
 */
const { prisma } = require('./client');
const { getOrCreateUser } = require('./users');
const { NotFoundError } = require('../utils/errors');

// Resolve the internal user id for a Clerk id, or null if there's no such user.
async function resolveUserId(clerkUserId) {
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  return user ? user.id : null;
}

// Messages are returned oldest-first so the client can render the transcript in order.
const MESSAGE_ORDER = { createdAt: 'asc' };

/**
 * Start a new discovery session for a user (creates the User row if needed).
 * @param {string} clerkUserId
 * @returns {Promise<import('@prisma/client').DiscoverySession & { messages: any[] }>}
 */
async function createSession(clerkUserId) {
  const user = await getOrCreateUser(clerkUserId);
  return prisma.discoverySession.create({
    data: { userId: user.id },
    include: { messages: { orderBy: MESSAGE_ORDER } },
  });
}

/**
 * Fetch a single session by id, scoped to its owner. Returns null if it doesn't
 * exist or belongs to another user.
 * @param {string} clerkUserId
 * @param {string} sessionId
 * @returns {Promise<(import('@prisma/client').DiscoverySession & { messages: any[] })|null>}
 */
async function getSession(clerkUserId, sessionId) {
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) return null;
  const session = await prisma.discoverySession.findFirst({
    where: { id: sessionId, userId: user.id },
    include: { messages: { orderBy: MESSAGE_ORDER } },
  });
  return session || null;
}

/**
 * Most recent active (not yet completed) session for a user, or null.
 * Lets the UI resume an in-progress discovery instead of starting over.
 * @param {string} clerkUserId
 * @returns {Promise<(import('@prisma/client').DiscoverySession & { messages: any[] })|null>}
 */
async function getActiveSession(clerkUserId) {
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) return null;
  const session = await prisma.discoverySession.findFirst({
    where: { userId: user.id, status: 'active' },
    orderBy: { createdAt: 'desc' },
    include: { messages: { orderBy: MESSAGE_ORDER } },
  });
  return session || null;
}

/**
 * Append a message to a session (owner-scoped) and bump the session's updatedAt.
 *
 * Ownership is enforced here, not just by the caller: the `updateMany` only
 * matches a row with BOTH the id and the owner's userId, so a non-owner (or a
 * missing user) affects zero rows and we refuse before writing any message.
 * Returns 404-style `NotFoundError` either way so we never confirm a session
 * exists for someone who doesn't own it.
 *
 * @param {string} clerkUserId
 * @param {string} sessionId
 * @param {'user'|'assistant'|'system'} role
 * @param {string} content
 * @returns {Promise<import('@prisma/client').Message>}
 */
async function addMessage(clerkUserId, sessionId, role, content) {
  const userId = await resolveUserId(clerkUserId);
  if (!userId) throw new NotFoundError('Discovery session not found.');
  const { count } = await prisma.discoverySession.updateMany({
    where: { id: sessionId, userId },
    data: { updatedAt: new Date() },
  });
  if (count === 0) throw new NotFoundError('Discovery session not found.');
  return prisma.message.create({ data: { sessionId, role, content } });
}

/**
 * Most recent enriched profile from a completed discovery session, or null.
 * Lets other features (e.g. career-path matching) reuse what discovery learned.
 * @param {string} clerkUserId
 * @returns {Promise<object|null>}
 */
async function getLatestEnrichedProfile(clerkUserId) {
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) return null;
  const session = await prisma.discoverySession.findFirst({
    where: { userId: user.id, status: 'completed', NOT: { enrichedProfile: { equals: null } } },
    orderBy: { updatedAt: 'desc' },
  });
  return session ? session.enrichedProfile : null;
}

/**
 * Mark a session completed and store the enriched profile (owner-scoped).
 * Same defense-in-depth as addMessage: a non-owner matches zero rows and is
 * rejected with a 404-style error.
 * @param {string} clerkUserId
 * @param {string} sessionId
 * @param {object} enrichedProfile
 * @returns {Promise<void>}
 */
async function completeSession(clerkUserId, sessionId, enrichedProfile) {
  const userId = await resolveUserId(clerkUserId);
  if (!userId) throw new NotFoundError('Discovery session not found.');
  const { count } = await prisma.discoverySession.updateMany({
    where: { id: sessionId, userId },
    data: { status: 'completed', enrichedProfile },
  });
  if (count === 0) throw new NotFoundError('Discovery session not found.');
}

module.exports = {
  createSession,
  getSession,
  getActiveSession,
  getLatestEnrichedProfile,
  addMessage,
  completeSession,
};
