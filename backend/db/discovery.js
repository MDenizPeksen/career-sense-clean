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
 * Append a message to a session and bump the session's updatedAt.
 * @param {string} sessionId
 * @param {'user'|'assistant'|'system'} role
 * @param {string} content
 * @returns {Promise<import('@prisma/client').Message>}
 */
async function addMessage(sessionId, role, content) {
  const [message] = await prisma.$transaction([
    prisma.message.create({ data: { sessionId, role, content } }),
    prisma.discoverySession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    }),
  ]);
  return message;
}

/**
 * Mark a session completed and store the enriched profile.
 * @param {string} sessionId
 * @param {object} enrichedProfile
 * @returns {Promise<import('@prisma/client').DiscoverySession>}
 */
async function completeSession(sessionId, enrichedProfile) {
  return prisma.discoverySession.update({
    where: { id: sessionId },
    data: { status: 'completed', enrichedProfile },
  });
}

module.exports = {
  createSession,
  getSession,
  getActiveSession,
  addMessage,
  completeSession,
};
