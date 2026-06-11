'use strict';

// Deterministic pass-through on protected routes (no Clerk needed in tests).
process.env.AUTH_ENABLED = 'false';

const test = require('node:test');
const assert = require('node:assert/strict');

// Stub the OpenAI service BEFORE the app (and its controllers) are required, so
// no test ever hits the live API. Injecting into the CommonJS require cache works
// across Node versions (node:test's mock.module is newer/experimental).
const openaiPath = require.resolve('../services/openaiService');
require.cache[openaiPath] = {
  id: openaiPath,
  filename: openaiPath,
  loaded: true,
  exports: {
    testOpenAIConnection: async () => true,
    analyzeCV: async () => ({}),
    getArchetype: async () => ({}),
    generateInterviewQuestions: async () => [
      { question: 'Tell me about a project you led.', category: 'Behavioral', difficulty: 'Easy' },
    ],
  },
};

const request = require('supertest');
const createApp = require('../app');

const app = createApp();

test('GET /health -> 200 ok', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});

test('GET / -> 200 with a running message', async () => {
  const res = await request(app).get('/');
  assert.equal(res.status, 200);
  assert.match(JSON.stringify(res.body), /running/i);
});

test('unknown route -> 404', async () => {
  const res = await request(app).get('/no/such/route');
  assert.equal(res.status, 404);
});

test('POST /api/interview/questions without role/level -> 400', async () => {
  const res = await request(app).post('/api/interview/questions').send({});
  assert.equal(res.status, 400);
});

test('POST /analyze with an unsupported file type -> 400', async () => {
  const res = await request(app)
    .post('/analyze')
    .attach('file', Buffer.from('not a real cv'), 'malware.exe');
  assert.equal(res.status, 400);
  assert.match(JSON.stringify(res.body), /unsupported file type/i);
});

test('POST /api/interview/questions with valid input -> 200 + questions (OpenAI mocked)', async () => {
  const res = await request(app)
    .post('/api/interview/questions')
    .send({ role: 'Software Developer', level: 'Senior' });
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.questions));
  assert.equal(res.body.questions.length, 1);
  assert.equal(res.body.questions[0].category, 'Behavioral');
});
