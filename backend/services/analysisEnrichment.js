'use strict';

const courses = require('./data/courseProvider');

/**
 * Enrich each personalized_learning_roadmap item with real course search links,
 * keyed on the item's `course` field. Deterministic and idempotent: links are
 * computed in code (never by the model), so this is safe to run on both freshly
 * generated and already-saved analyses.
 *
 * Mutates and returns the same analysis object.
 *
 * @param {object} analysis
 * @returns {object}
 */
function enrichLearningRoadmap(analysis) {
  if (!analysis || typeof analysis !== 'object') return analysis;
  const roadmap = analysis.personalized_learning_roadmap;
  if (!Array.isArray(roadmap)) return analysis;

  for (const item of roadmap) {
    if (!item || typeof item !== 'object') continue;
    if (item.learningLinks !== undefined) continue; // idempotent
    const skill = typeof item.course === 'string' ? item.course.trim() : '';
    item.learningLinks = skill ? courses.coursesForSkill(skill) : [];
  }
  return analysis;
}

module.exports = { enrichLearningRoadmap };
