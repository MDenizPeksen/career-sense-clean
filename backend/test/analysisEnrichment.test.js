'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { enrichLearningRoadmap } = require('../services/analysisEnrichment');

test('enrichLearningRoadmap: adds learningLinks per roadmap item keyed on course', () => {
  const analysis = {
    personalized_learning_roadmap: [
      { course: 'SQL', platform: 'Coursera', impact: 'x' },
      { course: 'Python', platform: 'Udemy', impact: 'y' },
    ],
  };
  enrichLearningRoadmap(analysis);
  const links = analysis.personalized_learning_roadmap[0].learningLinks;
  assert.equal(Array.isArray(links), true);
  assert.equal(links.length, 2); // Udemy + Coursera
  assert.equal(links[0].provider, 'Udemy');
  assert.match(links[0].url, /udemy\.com.*SQL/i);
  assert.equal(links[1].provider, 'Coursera');
});

test('enrichLearningRoadmap: no roadmap -> analysis unchanged, no throw', () => {
  const a = { user_profile: { name: 'A' } };
  const result = enrichLearningRoadmap(a);
  assert.equal(result, a);
  assert.equal('personalized_learning_roadmap' in result, false);
});

test('enrichLearningRoadmap: empty roadmap array stays empty', () => {
  const a = { personalized_learning_roadmap: [] };
  enrichLearningRoadmap(a);
  assert.deepEqual(a.personalized_learning_roadmap, []);
});

test('enrichLearningRoadmap: item without course gets empty learningLinks', () => {
  const a = { personalized_learning_roadmap: [{ platform: 'Coursera', impact: 'z' }] };
  enrichLearningRoadmap(a);
  assert.deepEqual(a.personalized_learning_roadmap[0].learningLinks, []);
});

test('enrichLearningRoadmap: null/garbage input does not throw', () => {
  assert.equal(enrichLearningRoadmap(null), null);
  assert.equal(enrichLearningRoadmap(undefined), undefined);
  enrichLearningRoadmap({ personalized_learning_roadmap: [null, 'x', 42] });
});

test('enrichLearningRoadmap: idempotent', () => {
  const a = { personalized_learning_roadmap: [{ course: 'React' }] };
  enrichLearningRoadmap(a);
  const first = JSON.stringify(a);
  enrichLearningRoadmap(a);
  assert.equal(JSON.stringify(a), first);
});
