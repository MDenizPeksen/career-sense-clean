'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeSkill,
  dedupeSkills,
  computeSkillGap,
  collectUserSkills,
  buildTransitionsFromAnalysis,
  aggregateTopGaps,
  buildLearningLinks,
} = require('../services/careerPathService');

test('normalizeSkill: case/space/punctuation-insensitive, keeps c++/c#/.net', () => {
  assert.equal(normalizeSkill('  Project   Management '), 'project management');
  assert.equal(normalizeSkill('React.js!'), 'react.js');
  assert.equal(normalizeSkill('C++'), 'c++');
  assert.equal(normalizeSkill('C#'), 'c#');
  assert.equal(normalizeSkill(null), '');
});

test('dedupeSkills: removes case/space duplicates, keeps first casing', () => {
  assert.deepEqual(dedupeSkills(['SQL', 'sql', ' Sql ', 'Python']), ['SQL', 'Python']);
  assert.deepEqual(dedupeSkills([]), []);
});

test('computeSkillGap: splits required into shared vs gap (normalized compare)', () => {
  const required = ['SQL', 'Python', 'Data Visualization', 'Machine Learning'];
  const user = ['python', 'sql ', 'Excel'];
  const { shared, gap } = computeSkillGap(required, user);
  assert.deepEqual(shared, ['SQL', 'Python']);
  assert.deepEqual(gap, ['Data Visualization', 'Machine Learning']);
});

test('computeSkillGap: handles empty inputs', () => {
  assert.deepEqual(computeSkillGap([], ['x']), { shared: [], gap: [] });
  assert.deepEqual(computeSkillGap(['x'], []), { shared: [], gap: ['x'] });
  assert.deepEqual(computeSkillGap(undefined, undefined), { shared: [], gap: [] });
});

test('computeSkillGap: dedupes repeated required skills', () => {
  const { shared, gap } = computeSkillGap(['SQL', 'sql', 'R'], ['sql']);
  assert.deepEqual(shared, ['SQL']);
  assert.deepEqual(gap, ['R']);
});

test('collectUserSkills: merges analysis + enriched profile, deduped', () => {
  const analysis = {
    profile_strengths: { skills: ['SQL', 'Python'], core_competencies: ['Leadership'] },
    user_profile: { skills: ['python'] },
  };
  const enriched = { strengths_to_leverage: ['Stakeholder Management', 'sql'] };
  const result = collectUserSkills(analysis, enriched);
  assert.deepEqual(result, ['SQL', 'Python', 'Leadership', 'Stakeholder Management']);
});

test('collectUserSkills: tolerates missing fields', () => {
  assert.deepEqual(collectUserSkills(null, null), []);
  assert.deepEqual(collectUserSkills({}, undefined), []);
});

test('buildTransitionsFromAnalysis: maps role_matching into transitions w/ gaps', () => {
  const analysis = {
    role_matching: [
      {
        role: 'Data Analyst',
        match_percentage: 78,
        transition_difficulty: 'Moderate',
        required_skills: ['SQL', 'Python', 'Tableau'],
        role_description: 'Analyze data.',
        salary_range: '60k-80k',
      },
      { role: '', required_skills: ['x'] }, // filtered out (no title)
    ],
  };
  const transitions = buildTransitionsFromAnalysis(analysis, ['sql']);
  assert.equal(transitions.length, 1);
  const t = transitions[0];
  assert.equal(t.title, 'Data Analyst');
  assert.equal(t.matchPercentage, 78);
  assert.equal(t.difficulty, 'Moderate');
  assert.equal(t.code, null);
  assert.deepEqual(t.sharedSkills, ['SQL']);
  assert.deepEqual(t.skillGap, ['Python', 'Tableau']);
});

test('buildTransitionsFromAnalysis: empty when no role_matching', () => {
  assert.deepEqual(buildTransitionsFromAnalysis({}, []), []);
  assert.deepEqual(buildTransitionsFromAnalysis({ role_matching: 'nope' }, []), []);
});

test('aggregateTopGaps: ranks most-common missing skills', () => {
  const transitions = [
    { skillGap: ['Python', 'SQL'] },
    { skillGap: ['python', 'Docker'] },
    { skillGap: ['SQL'] },
  ];
  const top = aggregateTopGaps(transitions, 2);
  // Python (2) and SQL (2) lead; limited to 2.
  assert.equal(top.length, 2);
  assert.ok(top.includes('Python'));
  assert.ok(top.includes('SQL'));
});

test('aggregateTopGaps: handles empty', () => {
  assert.deepEqual(aggregateTopGaps([]), []);
  assert.deepEqual(aggregateTopGaps(undefined), []);
});

test('buildLearningLinks: maps skills → learningLinks with Udemy + Coursera entries', () => {
  const links = buildLearningLinks(['Python', 'SQL']);
  assert.equal(links.length, 2);
  assert.equal(links[0].skill, 'Python');
  assert.equal(links[1].skill, 'SQL');
  // Each skill has 2 courses
  assert.equal(links[0].courses.length, 2);
  const providers = links[0].courses.map((c) => c.provider);
  assert.ok(providers.includes('Udemy'));
  assert.ok(providers.includes('Coursera'));
  // Each course has string url + title
  for (const c of links[0].courses) {
    assert.equal(typeof c.url, 'string');
    assert.equal(typeof c.title, 'string');
    assert.ok(c.url.startsWith('http'));
  }
});

test('buildLearningLinks: returns [] for empty input', () => {
  assert.deepEqual(buildLearningLinks([]), []);
});

test('buildLearningLinks: handles null/undefined input gracefully', () => {
  assert.deepEqual(buildLearningLinks(null), []);
  assert.deepEqual(buildLearningLinks(undefined), []);
});
