/**
 * Career-path controller.
 *
 * Returns the user's data-grounded career-shift options + skill gaps, computed
 * from their latest CV analysis (and discovery profile when present). Scoped to
 * the authenticated user via getRequestUserId.
 */
const { getRequestUserId } = require('../middleware/authMiddleware');
const { getCareerPaths } = require('../services/careerPathService');

/**
 * GET /api/career-paths
 * Returns { source, onetConfigured, currentRole, transitions, topSkillGaps, ... }.
 */
exports.getCareerPaths = async (req, res, next) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.json({
        source: 'none',
        onetConfigured: false,
        currentRole: null,
        transitions: [],
        topSkillGaps: [],
        generatedAt: new Date().toISOString(),
        message: 'Sign in and analyze your CV to see career paths.',
      });
    }
    const result = await getCareerPaths(userId);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};
