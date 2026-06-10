'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { parseOccupationList, parseSkillList, isConfigured } = require('../services/data/onetClient');

// Representative O*NET Web Services JSON shapes (per the WS docs). These let us
// test the parsers without hitting the live, credentialed API.

test('parseOccupationList: parses a keyword-search response', () => {
  const json = {
    keyword: 'nurse',
    total: 2,
    occupation: [
      { href: 'http://x/29-1141.00', code: '29-1141.00', title: 'Registered Nurses' },
      { href: 'http://x/29-2061.00', code: '29-2061.00', title: 'Licensed Practical Nurses' },
    ],
  };
  assert.deepEqual(parseOccupationList(json), [
    { code: '29-1141.00', title: 'Registered Nurses' },
    { code: '29-2061.00', title: 'Licensed Practical Nurses' },
  ]);
});

test('parseOccupationList: parses a related_occupation response', () => {
  const json = {
    related_occupation: [{ code: '15-2051.00', title: 'Data Scientists' }],
  };
  assert.deepEqual(parseOccupationList(json), [{ code: '15-2051.00', title: 'Data Scientists' }]);
});

test('parseOccupationList: falls back to first occupation-like array', () => {
  const json = { results: [{ code: '11-1011.00', title: 'Chief Executives' }] };
  assert.deepEqual(parseOccupationList(json), [{ code: '11-1011.00', title: 'Chief Executives' }]);
});

test('parseOccupationList: ignores malformed entries and bad input', () => {
  assert.deepEqual(parseOccupationList({ occupation: [{ code: 1, title: 2 }, { code: 'a' }] }), []);
  assert.deepEqual(parseOccupationList(null), []);
  assert.deepEqual(parseOccupationList('nope'), []);
  assert.deepEqual(parseOccupationList({}), []);
});

test('parseSkillList: parses skills nested under skills.element with scores', () => {
  const json = {
    skills: {
      element: [
        { id: '2.A.1.a', name: 'Reading Comprehension', score: { value: 75 } },
        { id: '2.A.1.b', name: 'Active Listening', score: { value: 60 } },
      ],
    },
  };
  assert.deepEqual(parseSkillList(json), [
    { name: 'Reading Comprehension', score: 75 },
    { name: 'Active Listening', score: 60 },
  ]);
});

test('parseSkillList: parses a flat element array and numeric value field', () => {
  const json = { element: [{ name: 'Critical Thinking', value: 80 }, { name: 'Writing' }] };
  assert.deepEqual(parseSkillList(json), [
    { name: 'Critical Thinking', score: 80 },
    { name: 'Writing', score: null },
  ]);
});

test('parseSkillList: ignores nameless entries and bad input', () => {
  assert.deepEqual(parseSkillList({ element: [{ score: 5 }] }), []);
  assert.deepEqual(parseSkillList(null), []);
  assert.deepEqual(parseSkillList({}), []);
});

test('isConfigured: reflects env credentials', () => {
  const origUser = process.env.ONET_USERNAME;
  const origPass = process.env.ONET_PASSWORD;
  try {
    delete process.env.ONET_USERNAME;
    delete process.env.ONET_PASSWORD;
    assert.equal(isConfigured(), false);
    process.env.ONET_USERNAME = 'u';
    process.env.ONET_PASSWORD = 'p';
    assert.equal(isConfigured(), true);
  } finally {
    if (origUser === undefined) delete process.env.ONET_USERNAME;
    else process.env.ONET_USERNAME = origUser;
    if (origPass === undefined) delete process.env.ONET_PASSWORD;
    else process.env.ONET_PASSWORD = origPass;
  }
});
