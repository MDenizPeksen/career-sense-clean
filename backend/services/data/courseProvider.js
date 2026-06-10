'use strict';

/**
 * Course-link provider for skill gaps.
 *
 * Default implementation: generates deep search-page links (Udemy, Coursera).
 * No network calls, no API key required. isConfigured() always returns false
 * until a real course API is wired behind it.
 *
 * Mirrors the onetClient shape (isConfigured / main function) so a real
 * provider can be swapped in without touching callers.
 */

const PROVIDERS = [
  {
    name: 'Udemy',
    buildUrl: (skill) =>
      `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skill)}`,
  },
  {
    name: 'Coursera',
    buildUrl: (skill) =>
      `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`,
  },
];

const isConfigured = () => false;

/**
 * Return course search links for a skill.
 * @param {string} skill
 * @returns {{ provider: string, title: string, url: string }[]}
 */
function coursesForSkill(skill) {
  return PROVIDERS.map(({ name, buildUrl }) => ({
    provider: name,
    title: `Browse ${skill} courses on ${name}`,
    url: buildUrl(skill),
  }));
}

module.exports = { isConfigured, coursesForSkill };
