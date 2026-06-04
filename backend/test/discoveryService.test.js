'use strict';

// The OpenAI client is constructed at import time and requires a key to exist
// (it doesn't validate it). Set a dummy one before requiring the service so these
// pure-function tests run without any real credentials or network access.
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-key';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  parseAgentResponse,
  buildCvContext,
  DISCOVERY_DIMENSIONS,
  TARGET_USER_ANSWERS,
} = require('../services/discoveryService');

test('parseAgentResponse: parses an in-progress turn', () => {
  const raw = JSON.stringify({
    reply: 'What is prompting you to consider a change?',
    complete: false,
    enrichedProfile: null,
  });
  const turn = parseAgentResponse(raw);
  assert.equal(turn.complete, false);
  assert.equal(turn.reply, 'What is prompting you to consider a change?');
  assert.equal(turn.enrichedProfile, null);
});

test('parseAgentResponse: returns the enriched profile on completion', () => {
  const profile = { headline: 'PM moving into data', target_roles: ['Data Analyst'] };
  const raw = JSON.stringify({ reply: 'Thanks — all set!', complete: true, enrichedProfile: profile });
  const turn = parseAgentResponse(raw);
  assert.equal(turn.complete, true);
  assert.deepEqual(turn.enrichedProfile, profile);
});

test('parseAgentResponse: tolerates markdown code fences', () => {
  const raw = '```json\n{"reply":"Hi there!","complete":false,"enrichedProfile":null}\n```';
  const turn = parseAgentResponse(raw);
  assert.equal(turn.reply, 'Hi there!');
  assert.equal(turn.complete, false);
});

test('parseAgentResponse: trims the reply', () => {
  const raw = JSON.stringify({ reply: '  spaced out  ', complete: false });
  assert.equal(parseAgentResponse(raw).reply, 'spaced out');
});

test('parseAgentResponse: ignores a profile when not complete', () => {
  const raw = JSON.stringify({
    reply: 'One more question…',
    complete: false,
    enrichedProfile: { headline: 'premature' },
  });
  assert.equal(parseAgentResponse(raw).enrichedProfile, null);
});

test('parseAgentResponse: complete with a non-object profile yields null', () => {
  const raw = JSON.stringify({ reply: 'Done', complete: true, enrichedProfile: 'oops' });
  const turn = parseAgentResponse(raw);
  assert.equal(turn.complete, true);
  assert.equal(turn.enrichedProfile, null);
});

test('parseAgentResponse: throws on empty input', () => {
  assert.throws(() => parseAgentResponse(''), /Empty discovery response/);
  assert.throws(() => parseAgentResponse('   '), /Empty discovery response/);
});

test('parseAgentResponse: throws on invalid JSON', () => {
  assert.throws(() => parseAgentResponse('not json at all'), /Failed to parse discovery response/);
});

test('parseAgentResponse: throws when the reply is missing or blank', () => {
  assert.throws(() => parseAgentResponse(JSON.stringify({ complete: false })), /missing a reply/);
  assert.throws(
    () => parseAgentResponse(JSON.stringify({ reply: '   ', complete: false })),
    /missing a reply/
  );
});

test('buildCvContext: returns null without a usable analysis', () => {
  assert.equal(buildCvContext(null), null);
  assert.equal(buildCvContext(undefined), null);
  assert.equal(buildCvContext('nope'), null);
  assert.equal(buildCvContext({}), null);
  assert.equal(buildCvContext({ user_profile: {} }), null);
});

test('buildCvContext: summarizes the key fields', () => {
  const ctx = buildCvContext({
    user_profile: { current_role: 'Product Manager', sector: 'Fintech', years_experience: 6 },
    profile_strengths: { skills: ['Roadmapping', 'SQL', 'Stakeholder mgmt'] },
    role_matching: [{ role: 'Data Analyst' }, { role: 'Product Owner' }],
  });
  assert.match(ctx, /Current role: Product Manager/);
  assert.match(ctx, /Sector: Fintech/);
  assert.match(ctx, /Years of experience: 6/);
  assert.match(ctx, /Key skills: Roadmapping, SQL, Stakeholder mgmt/);
  assert.match(ctx, /AI-suggested role matches: Data Analyst, Product Owner/);
});

test('buildCvContext: caps skills at 8', () => {
  const skills = Array.from({ length: 20 }, (_, i) => `skill${i}`);
  const ctx = buildCvContext({
    user_profile: { current_role: 'Engineer' },
    profile_strengths: { skills },
  });
  assert.match(ctx, /skill7/);
  assert.doesNotMatch(ctx, /skill8/);
});

test('module exposes discovery dimensions and a target answer count', () => {
  assert.ok(Array.isArray(DISCOVERY_DIMENSIONS) && DISCOVERY_DIMENSIONS.length > 0);
  assert.equal(typeof TARGET_USER_ANSWERS, 'number');
  assert.ok(TARGET_USER_ANSWERS > 0);
});
