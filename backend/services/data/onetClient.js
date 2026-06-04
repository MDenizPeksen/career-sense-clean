/**
 * O*NET Web Services client.
 *
 * O*NET (https://services.onetcenter.org) is the U.S. Dept. of Labor's free,
 * authoritative occupational database. We use it to ground career-shift
 * suggestions in real data: map a role to an occupation, find genuinely related
 * occupations (transition targets), and pull the skills an occupation requires.
 *
 * Access requires a free developer account; credentials are supplied via env:
 *   ONET_USERNAME, ONET_PASSWORD   (HTTP Basic auth)
 * When they're absent, isConfigured() returns false and callers fall back to
 * AI-derived data — so the app runs fine without O*NET, and "just works" once
 * the credentials are added.
 *
 * The Web Services API returns XML by default; we request JSON via Accept.
 * Response shapes vary slightly across endpoints, so parsing is intentionally
 * defensive (see the pure parse* helpers, which are unit-tested with fixtures).
 *
 * NOTE: the live HTTP paths below follow the O*NET WS docs but have not been
 * smoke-tested against the live service yet (no credentials in this env). The
 * pure parsers are fully tested; verify the endpoints once credentials land.
 */

const BASE_URL = process.env.ONET_BASE_URL || 'https://services.onetcenter.org/ws';
const REQUEST_TIMEOUT_MS = 8000;

const isConfigured = () =>
  Boolean(process.env.ONET_USERNAME && process.env.ONET_PASSWORD);

function authHeader() {
  const token = Buffer.from(
    `${process.env.ONET_USERNAME}:${process.env.ONET_PASSWORD}`
  ).toString('base64');
  return `Basic ${token}`;
}

/**
 * Low-level GET against the O*NET WS, returning parsed JSON.
 * Throws on non-2xx or network/timeout so callers can fall back gracefully.
 * @param {string} pathAndQuery - e.g. "/online/search?keyword=nurse"
 * @returns {Promise<any>}
 */
async function onetGet(pathAndQuery) {
  if (!isConfigured()) {
    throw new Error('O*NET is not configured (missing ONET_USERNAME/ONET_PASSWORD)');
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}${pathAndQuery}`, {
      method: 'GET',
      headers: {
        Authorization: authHeader(),
        Accept: 'application/json',
        'User-Agent': 'CareerSense/1.0 (career guidance app)',
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`O*NET request failed: ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// ---- Pure parsers (no I/O; unit-tested against fixtures) ---------------------

const isOccupationLike = (o) =>
  o && typeof o === 'object' && typeof o.code === 'string' && typeof o.title === 'string';

/**
 * Extract a normalized occupation list from any O*NET list response.
 * Handles the common envelopes (`occupation`, `related_occupation`, `career`)
 * and otherwise falls back to the first array of occupation-like objects.
 * @param {any} json
 * @returns {{ code: string, title: string }[]}
 */
function parseOccupationList(json) {
  if (!json || typeof json !== 'object') return [];
  const candidates = [
    json.occupation,
    json.related_occupation,
    json.career,
    json.occupations,
  ];
  let list = candidates.find((c) => Array.isArray(c));
  if (!list) {
    list = Object.values(json).find(
      (v) => Array.isArray(v) && v.some(isOccupationLike)
    );
  }
  if (!Array.isArray(list)) return [];
  return list
    .filter(isOccupationLike)
    .map((o) => ({ code: o.code, title: o.title }));
}

/**
 * Extract a normalized skill list from an O*NET skills/details response.
 * Skills come back under `element` (often nested under `skills`), each with a
 * `name` and an importance/level `score`.
 * @param {any} json
 * @returns {{ name: string, score: number|null }[]}
 */
function parseSkillList(json) {
  if (!json || typeof json !== 'object') return [];
  const candidates = [
    json.element,
    json.skills && json.skills.element,
    json.skill,
    json.skills,
  ];
  let list = candidates.find((c) => Array.isArray(c));
  if (!list) {
    list = Object.values(json).find(
      (v) => Array.isArray(v) && v.some((e) => e && typeof e.name === 'string')
    );
  }
  if (!Array.isArray(list)) return [];
  return list
    .filter((e) => e && typeof e.name === 'string' && e.name.trim())
    .map((e) => {
      const rawScore =
        (e.score && (e.score.value ?? e.score)) ?? e.value ?? e.importance ?? null;
      // Guard against Number(null) === 0: only coerce when a value is present.
      const score =
        rawScore === null || rawScore === undefined || rawScore === '' ? null : Number(rawScore);
      return { name: e.name.trim(), score: Number.isFinite(score) ? score : null };
    });
}

// ---- Public API --------------------------------------------------------------

/**
 * Search occupations by keyword (a role/title). Returns the top matches.
 * @param {string} keyword
 * @param {number} [limit=10]
 * @returns {Promise<{ code: string, title: string }[]>}
 */
async function searchOccupations(keyword, limit = 10) {
  if (!keyword || !keyword.trim()) return [];
  const json = await onetGet(
    `/online/search?keyword=${encodeURIComponent(keyword.trim())}&end=${limit}`
  );
  return parseOccupationList(json).slice(0, limit);
}

/**
 * Occupations genuinely related to a given O*NET code — the transition targets.
 * @param {string} code - O*NET-SOC code, e.g. "15-1252.00"
 * @param {number} [limit=10]
 * @returns {Promise<{ code: string, title: string }[]>}
 */
async function getRelatedOccupations(code, limit = 10) {
  if (!code) return [];
  const json = await onetGet(`/online/occupations/${encodeURIComponent(code)}/related_occupations`);
  return parseOccupationList(json).slice(0, limit);
}

/**
 * The skills an occupation requires, most-important first where scores exist.
 * @param {string} code - O*NET-SOC code
 * @param {number} [limit=20]
 * @returns {Promise<{ name: string, score: number|null }[]>}
 */
async function getOccupationSkills(code, limit = 20) {
  if (!code) return [];
  const json = await onetGet(`/online/occupations/${encodeURIComponent(code)}/details/skills`);
  const skills = parseSkillList(json);
  skills.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return skills.slice(0, limit);
}

module.exports = {
  isConfigured,
  searchOccupations,
  getRelatedOccupations,
  getOccupationSkills,
  // Exported for unit testing:
  parseOccupationList,
  parseSkillList,
};
