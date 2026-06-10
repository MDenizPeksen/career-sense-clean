'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { isConfigured, coursesForSkill } = require('../services/data/courseProvider');

test('isConfigured: always returns false (no real API wired yet)', () => {
  assert.equal(isConfigured(), false);
});

test('coursesForSkill: returns exactly 2 links (Udemy + Coursera)', () => {
  const links = coursesForSkill('Python');
  assert.equal(links.length, 2);
  const providers = links.map((l) => l.provider);
  assert.ok(providers.includes('Udemy'));
  assert.ok(providers.includes('Coursera'));
});

test('coursesForSkill: URL contains percent-encoded skill name', () => {
  const links = coursesForSkill('Machine Learning');
  for (const { url } of links) {
    assert.ok(url.includes('Machine%20Learning'), `URL should encode spaces: ${url}`);
  }
});

test('coursesForSkill: encodes C++ correctly', () => {
  const links = coursesForSkill('C++');
  for (const { url } of links) {
    assert.ok(url.includes('C%2B%2B'), `URL should encode +: ${url}`);
  }
});

test('coursesForSkill: title contains skill name and provider name', () => {
  const links = coursesForSkill('SQL');
  for (const { title, provider } of links) {
    assert.ok(title.includes('SQL'), `title should contain skill: ${title}`);
    assert.ok(title.includes(provider), `title should contain provider name: ${title}`);
  }
});

test('coursesForSkill: empty string returns 2 links without crashing', () => {
  const links = coursesForSkill('');
  assert.equal(links.length, 2);
  for (const { url, title } of links) {
    assert.equal(typeof url, 'string');
    assert.equal(typeof title, 'string');
  }
});
