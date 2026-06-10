/**
 * Conversational Discovery agent.
 *
 * A multi-turn intake coach for career-changers. Given the conversation so far
 * (and, optionally, the user's most recent CV analysis for context), it returns
 * the next assistant turn: usually one adaptive follow-up question, or — once it
 * has gathered enough — a closing message plus a structured `enrichedProfile`.
 *
 * It reuses the shared OpenAI client and the OpenAIError/timeout patterns from
 * openaiService so behavior is consistent across the codebase. The model output
 * is always genuine — we never fabricate the user's answers or profile.
 */
const { callOpenAIJson } = require('./openaiService');
const openaiConfig = require('../config/openai');
const { OpenAIError, ValidationError } = require('../utils/errors');
const buildDiscoverySystemPrompt = require('./prompts/discoveryPrompt');

// The dimensions the discovery agent tries to understand before completing.
// Kept here (not just in the prompt) so it's documented and testable.
const DISCOVERY_DIMENSIONS = [
  'motivation for change / what is prompting this',
  'current situation (role, industry, what they do day-to-day)',
  'where they want to go (target roles or directions, even if fuzzy)',
  'target industries or domains of interest',
  'constraints: location / remote, timeline, compensation needs',
  'risk tolerance and appetite for retraining',
  'learning preferences and time available to upskill',
];

// We aim for a focused conversation, not an interrogation. The agent is told it
// MAY complete once it has enough signal, and SHOULD by this many user answers.
const TARGET_USER_ANSWERS = 6;

const SYSTEM_PROMPT = buildDiscoverySystemPrompt(DISCOVERY_DIMENSIONS, TARGET_USER_ANSWERS);

/**
 * Build the compact CV-context block injected as a system message, so the agent
 * can personalize questions without re-asking what the CV already tells us.
 * Returns null when there's no usable analysis.
 * @param {object|null} analysis - a persisted /analyze payload, or null
 * @returns {string|null}
 */
function buildCvContext(analysis) {
  if (!analysis || typeof analysis !== 'object') return null;
  const up = analysis.user_profile || {};
  const strengths = analysis.profile_strengths || {};
  const parts = [];
  if (up.current_role) parts.push(`Current role: ${up.current_role}`);
  if (up.sector) parts.push(`Sector: ${up.sector}`);
  if (up.years_experience) parts.push(`Years of experience: ${up.years_experience}`);
  if (Array.isArray(strengths.skills) && strengths.skills.length) {
    parts.push(`Key skills: ${strengths.skills.slice(0, 8).join(', ')}`);
  }
  if (Array.isArray(analysis.role_matching) && analysis.role_matching.length) {
    const roles = analysis.role_matching.map((r) => r.role).filter(Boolean).slice(0, 3);
    if (roles.length) parts.push(`AI-suggested role matches: ${roles.join(', ')}`);
  }
  if (!parts.length) return null;
  return `Context from the user's CV analysis (use it to personalize and avoid re-asking):\n${parts.join('\n')}`;
}

/**
 * Parse and validate the agent's raw JSON string into a normalized turn.
 * Pure (no I/O) so it can be unit-tested without OpenAI. Tolerates markdown
 * code fences and missing optional fields; throws OpenAIError on unusable output.
 * @param {string} raw - the model's message content
 * @returns {{ reply: string, complete: boolean, enrichedProfile: object|null }}
 */
function parseAgentResponse(raw) {
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new OpenAIError(
      'Empty discovery response',
      'The AI returned an empty response. Please try again.',
      500
    );
  }

  let parsed;
  try {
    const cleaned = raw.replace(/```json\s*|\s*```/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new OpenAIError(
      'Failed to parse discovery response',
      'The AI returned an invalid response format. Please try again.',
      500
    );
  }

  const reply = typeof parsed.reply === 'string' ? parsed.reply.trim() : '';
  if (!reply) {
    throw new OpenAIError(
      'Discovery response missing a reply',
      'The AI returned a response with no message. Please try again.',
      500
    );
  }

  const complete = parsed.complete === true;
  // Only surface an enriched profile when the agent says it's complete and the
  // profile is an object — never half-built state mid-conversation.
  const enrichedProfile =
    complete && parsed.enrichedProfile && typeof parsed.enrichedProfile === 'object'
      ? parsed.enrichedProfile
      : null;

  return { reply, complete, enrichedProfile };
}

/**
 * Run one turn of the discovery agent.
 * @param {Array<{ role: 'user'|'assistant'|'system', content: string }>} history
 *   The conversation so far (excluding the system prompt). For the very first
 *   turn pass an empty array — the agent will open the conversation.
 * @param {object|null} [analysis] - the user's latest CV analysis, for context
 * @returns {Promise<{ reply: string, complete: boolean, enrichedProfile: object|null }>}
 */
async function runDiscoveryTurn(history, analysis = null) {
  if (!Array.isArray(history)) {
    throw new ValidationError('Discovery history must be an array');
  }

  const messages = [{ role: 'system', content: SYSTEM_PROMPT }];

  const cvContext = buildCvContext(analysis);
  if (cvContext) {
    messages.push({ role: 'system', content: cvContext });
  }

  if (history.length === 0) {
    // Kick off the conversation with a clear instruction for the opening turn.
    messages.push({
      role: 'system',
      content:
        'This is the start of the conversation. Greet the user warmly in one sentence and ask your first question (their motivation for exploring a change or growth).',
    });
  } else {
    for (const m of history) {
      // Only forward user/assistant turns to the model; persisted system notes stay server-side.
      if (m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string') {
        messages.push({ role: m.role, content: m.content });
      }
    }
  }

  // Shared helper owns the call + timeout + API-error wrapping; we pass the
  // discovery-specific validator so its OpenAIErrors surface unchanged.
  return callOpenAIJson({
    messages,
    maxTokens: openaiConfig.maxTokens.discovery,
    temperature: openaiConfig.temperature.discovery,
    parse: parseAgentResponse,
  });
}

module.exports = {
  runDiscoveryTurn,
  // Exported for unit testing / reuse:
  parseAgentResponse,
  buildCvContext,
  DISCOVERY_DIMENSIONS,
  TARGET_USER_ANSWERS,
};
