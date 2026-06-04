/**
 * Career-path / skill-gap engine.
 *
 * Turns a user's saved CV analysis (+ optional discovery enriched profile) into
 * concrete career-shift options: for each target role, which of the user's
 * skills already transfer ("shared") and which they still need ("gap").
 *
 * Two data sources, chosen at runtime:
 *   - "onet":     the required skills come from O*NET (real labor-market data).
 *   - "analysis": fall back to the skills the AI analysis already produced.
 * Either way we only ever compute set differences over genuine data — we never
 * invent roles, skills, or numbers.
 *
 * All ranking/diffing lives in pure, exported functions (unit-tested). The async
 * orchestrator `getCareerPaths` is the only part that touches the DB / network.
 */
const onet = require('./data/onetClient');
const { getLatestAnalysis } = require('../db/analyses');
const { getLatestEnrichedProfile } = require('../db/discovery');

// ---- Pure helpers ------------------------------------------------------------

/** Normalize a skill string for comparison (case/space/punctuation-insensitive). */
function normalizeSkill(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#. ]/g, ' ') // keep things like c++, c#, .net
    .replace(/\s+/g, ' ')
    .trim();
}

/** Dedupe a list of skills, preserving the first original casing seen. */
function dedupeSkills(skills) {
  const seen = new Set();
  const out = [];
  for (const raw of skills || []) {
    const key = normalizeSkill(raw);
    if (key && !seen.has(key)) {
      seen.add(key);
      out.push(typeof raw === 'string' ? raw.trim() : String(raw));
    }
  }
  return out;
}

/**
 * Split a role's required skills into the ones the user already has vs. needs.
 * Comparison is normalized; output preserves the required-skill's original text.
 * @param {string[]} requiredSkills
 * @param {string[]} userSkills
 * @returns {{ shared: string[], gap: string[] }}
 */
function computeSkillGap(requiredSkills, userSkills) {
  const userSet = new Set((userSkills || []).map(normalizeSkill).filter(Boolean));
  const shared = [];
  const gap = [];
  const seen = new Set();
  for (const req of requiredSkills || []) {
    const key = normalizeSkill(req);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    (userSet.has(key) ? shared : gap).push(typeof req === 'string' ? req.trim() : String(req));
  }
  return { shared, gap };
}

/**
 * Gather everything we know the user is skilled in, from the analysis and the
 * (optional) discovery enriched profile.
 * @param {object} analysis - a persisted /analyze payload
 * @param {object|null} enrichedProfile
 * @returns {string[]}
 */
function collectUserSkills(analysis, enrichedProfile) {
  const a = analysis || {};
  const ps = a.profile_strengths || {};
  const up = a.user_profile || {};
  const ep = enrichedProfile || {};
  return dedupeSkills([
    ...(Array.isArray(ps.skills) ? ps.skills : []),
    ...(Array.isArray(ps.core_competencies) ? ps.core_competencies : []),
    ...(Array.isArray(up.skills) ? up.skills : []),
    ...(Array.isArray(ep.strengths_to_leverage) ? ep.strengths_to_leverage : []),
  ]);
}

/**
 * Build transition candidates from the AI analysis's role_matching list.
 * Each carries the role's required skills split into shared/gap vs. the user.
 * @param {object} analysis
 * @param {string[]} userSkills
 * @returns {Array<object>}
 */
function buildTransitionsFromAnalysis(analysis, userSkills) {
  const roles = Array.isArray(analysis?.role_matching) ? analysis.role_matching : [];
  return roles
    .filter((r) => r && typeof r.role === 'string' && r.role.trim())
    .map((r) => {
      const required = Array.isArray(r.required_skills) ? r.required_skills : [];
      const { shared, gap } = computeSkillGap(required, userSkills);
      return {
        title: r.role.trim(),
        code: null, // filled in when grounded against O*NET
        matchPercentage: typeof r.match_percentage === 'number' ? r.match_percentage : null,
        difficulty: r.transition_difficulty || null,
        description: r.role_description || '',
        salaryRange: r.salary_range || null,
        requiredSkills: dedupeSkills(required),
        sharedSkills: shared,
        skillGap: gap,
      };
    });
}

/**
 * Aggregate the most commonly-missing skills across all transitions.
 * @param {Array<{ skillGap: string[] }>} transitions
 * @param {number} [limit=8]
 * @returns {string[]}
 */
function aggregateTopGaps(transitions, limit = 8) {
  const counts = new Map(); // normalized -> { label, n }
  for (const t of transitions || []) {
    for (const skill of t.skillGap || []) {
      const key = normalizeSkill(skill);
      if (!key) continue;
      const entry = counts.get(key) || { label: skill, n: 0 };
      entry.n += 1;
      counts.set(key, entry);
    }
  }
  return [...counts.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, limit)
    .map((e) => e.label);
}

// ---- Orchestrator (DB + O*NET I/O) ------------------------------------------

/**
 * Try to ground a single transition against O*NET: find its occupation code and
 * recompute the skill gap from the occupation's real required skills. Returns a
 * new transition object on success, or null to signal "couldn't ground this one".
 */
async function groundTransitionWithOnet(transition, userSkills) {
  const matches = await onet.searchOccupations(transition.title, 1);
  const occ = matches[0];
  if (!occ) return null;
  const skills = await onet.getOccupationSkills(occ.code);
  if (!skills.length) return null;
  const required = dedupeSkills(skills.map((s) => s.name));
  const { shared, gap } = computeSkillGap(required, userSkills);
  return {
    ...transition,
    code: occ.code,
    title: occ.title || transition.title,
    requiredSkills: required,
    sharedSkills: shared,
    skillGap: gap,
  };
}

/**
 * Compute career-path options for a user.
 * @param {string} clerkUserId
 * @returns {Promise<{
 *   source: 'onet'|'analysis'|'none',
 *   onetConfigured: boolean,
 *   currentRole: string|null,
 *   transitions: Array<object>,
 *   topSkillGaps: string[],
 *   generatedAt: string,
 *   message?: string
 * }>}
 */
async function getCareerPaths(clerkUserId) {
  const generatedAt = new Date().toISOString();
  const analysis = await getLatestAnalysis(clerkUserId);

  if (!analysis) {
    return {
      source: 'none',
      onetConfigured: onet.isConfigured(),
      currentRole: null,
      transitions: [],
      topSkillGaps: [],
      generatedAt,
      message: 'Upload and analyze your CV first to see career paths.',
    };
  }

  const enrichedProfile = await getLatestEnrichedProfile(clerkUserId).catch(() => null);
  const userSkills = collectUserSkills(analysis, enrichedProfile);
  const currentRole = analysis.user_profile?.current_role || null;

  // Baseline: transitions derived from the AI analysis (always available).
  let transitions = buildTransitionsFromAnalysis(analysis, userSkills);
  let source = 'analysis';

  // Upgrade with real O*NET data when configured. Per-transition try/catch so a
  // single failed lookup never sinks the whole response; if at least one role
  // grounds successfully we label the result "onet".
  if (onet.isConfigured() && transitions.length) {
    let groundedAny = false;
    transitions = await Promise.all(
      transitions.map(async (t) => {
        try {
          const grounded = await groundTransitionWithOnet(t, userSkills);
          if (grounded) {
            groundedAny = true;
            return grounded;
          }
        } catch (err) {
          console.error(`O*NET grounding failed for "${t.title}":`, err.message);
        }
        return t;
      })
    );
    if (groundedAny) source = 'onet';
  }

  return {
    source,
    onetConfigured: onet.isConfigured(),
    currentRole,
    transitions,
    topSkillGaps: aggregateTopGaps(transitions),
    generatedAt,
  };
}

module.exports = {
  getCareerPaths,
  // Exported for unit testing:
  normalizeSkill,
  dedupeSkills,
  computeSkillGap,
  collectUserSkills,
  buildTransitionsFromAnalysis,
  aggregateTopGaps,
};
