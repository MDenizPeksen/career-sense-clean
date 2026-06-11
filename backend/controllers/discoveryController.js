/**
 * Discovery controller.
 *
 * Drives the multi-turn Conversational Discovery flow:
 *   - startSession:  create a session and produce the agent's opening question
 *   - sendMessage:   append the user's answer, run the agent, persist its reply
 *                    (and the enriched profile once the session completes)
 *   - getSession:    fetch one session (user-scoped)
 *   - getLatestSession: resume the in-progress session, if any
 *
 * Sessions are scoped to the authenticated user via getRequestUserId. The agent
 * is given the user's latest CV analysis (when present) so it can personalize.
 */
const { getRequestUserId } = require('../middleware/authMiddleware');
const { ValidationError, NotFoundError, UnauthorizedError } = require('../utils/errors');
const discoveryService = require('../services/discoveryService');
const { getLatestAnalysis } = require('../db/analyses');
const {
  createSession,
  getSession,
  getActiveSession,
  addMessage,
  completeSession,
} = require('../db/discovery');

// Shape a persisted session (with messages) into the client-facing DTO.
function serializeSession(session) {
  if (!session) return null;
  return {
    id: session.id,
    status: session.status,
    enrichedProfile: session.enrichedProfile ?? null,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    messages: (session.messages || [])
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content, createdAt: m.createdAt })),
  };
}

// Map persisted messages into the agent's history shape (user/assistant only).
function toAgentHistory(messages = []) {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role, content: m.content }));
}

/**
 * POST /api/discovery/sessions
 * Create a new discovery session and return it with the agent's opening message.
 */
exports.startSession = async (req, res, next) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      throw new UnauthorizedError('Authentication required to start a discovery session.');
    }

    const session = await createSession(userId);

    // Personalize the opening turn with the user's latest analysis, if any.
    const analysis = await getLatestAnalysis(userId).catch(() => null);
    const turn = await discoveryService.runDiscoveryTurn([], analysis);

    await addMessage(userId, session.id, 'assistant', turn.reply);

    // Re-fetch so the response includes the freshly stored opening message.
    const fresh = await getSession(userId, session.id);
    return res.status(201).json({ session: serializeSession(fresh) });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/discovery/sessions/:id/messages
 * Append the user's message, run the agent, persist its reply, and (if the agent
 * decides it's done) complete the session with the enriched profile.
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      throw new UnauthorizedError('Authentication required.');
    }

    const { id } = req.params;
    const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';
    if (!content) {
      throw new ValidationError('Message content is required', 'Please type a message.');
    }
    if (content.length > 4000) {
      throw new ValidationError('Message is too long', 'Please keep your message under 4000 characters.');
    }

    const session = await getSession(userId, id);
    if (!session) {
      throw new NotFoundError('Discovery session not found.');
    }
    if (session.status === 'completed') {
      throw new ValidationError('This discovery session is already complete.');
    }

    // Persist the user's answer, then run the agent over the full transcript.
    await addMessage(userId, id, 'user', content);
    const history = [...toAgentHistory(session.messages), { role: 'user', content }];

    const analysis = await getLatestAnalysis(userId).catch(() => null);
    const turn = await discoveryService.runDiscoveryTurn(history, analysis);

    await addMessage(userId, id, 'assistant', turn.reply);
    if (turn.complete) {
      await completeSession(userId, id, turn.enrichedProfile || {});
    }

    const fresh = await getSession(userId, id);
    return res.json({ session: serializeSession(fresh) });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/discovery/sessions/:id
 * Fetch a single session (scoped to the authenticated user).
 */
exports.getSessionById = async (req, res, next) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      throw new UnauthorizedError('Authentication required.');
    }
    const session = await getSession(userId, req.params.id);
    if (!session) {
      throw new NotFoundError('Discovery session not found.');
    }
    return res.json({ session: serializeSession(session) });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/discovery/sessions/latest
 * Return the user's in-progress (active) session, or null. Lets the UI resume.
 */
exports.getLatestSession = async (req, res, next) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.json({ session: null });
    }
    const session = await getActiveSession(userId);
    return res.json({ session: serializeSession(session) });
  } catch (error) {
    next(error);
  }
};
