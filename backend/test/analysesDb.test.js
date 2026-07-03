'use strict';

// Verifies analysis reads are scoped to the owning user — the user-data
// isolation invariant (CLAUDE.md: enforced in the backend, not the DB). A user
// must never receive another user's saved analysis, and an unknown user gets
// null rather than leaking the newest row of some other user.

const test = require('node:test');
const assert = require('node:assert/strict');

// Fake data: analysis 'a1' belongs to userA, 'a2' to userB.
const USERS = { 'clerk-A': { id: 'userA' }, 'clerk-B': { id: 'userB' } };
const ANALYSES = [
  { id: 'a1', userId: 'userA', payload: { owner: 'A' }, createdAt: new Date('2026-01-01') },
  { id: 'a2', userId: 'userB', payload: { owner: 'B' }, createdAt: new Date('2026-02-01') },
];

// Inject a fake Prisma client BEFORE requiring the helpers, so no real DB is hit.
const clientPath = require.resolve('../db/client');
require.cache[clientPath] = {
  id: clientPath,
  filename: clientPath,
  loaded: true,
  exports: {
    prisma: {
      user: {
        findUnique: async ({ where: { clerkUserId } }) => USERS[clerkUserId] || null,
      },
      analysis: {
        // findFirst honors the userId filter so a query can only ever see the
        // caller's own rows (newest first) — mirrors the real Prisma contract.
        findFirst: async ({ where: { userId }, orderBy }) => {
          const rows = ANALYSES.filter((a) => a.userId === userId);
          if (orderBy && orderBy.createdAt === 'desc') {
            rows.sort((x, y) => y.createdAt - x.createdAt);
          }
          return rows[0] || null;
        },
      },
    },
  },
};

const { getLatestAnalysis } = require('../db/analyses');

test('getLatestAnalysis returns only the requesting user\'s payload', async () => {
  assert.deepEqual(await getLatestAnalysis('clerk-A'), { owner: 'A' });
  assert.deepEqual(await getLatestAnalysis('clerk-B'), { owner: 'B' });
});

test('getLatestAnalysis never leaks another user\'s newer analysis', async () => {
  // userB's analysis (a2) is newer than userA's; an unscoped query would return
  // it. userA must still get their own older row, not the global newest.
  const result = await getLatestAnalysis('clerk-A');
  assert.notDeepEqual(result, { owner: 'B' });
  assert.deepEqual(result, { owner: 'A' });
});

test('getLatestAnalysis returns null for an unknown user', async () => {
  assert.equal(await getLatestAnalysis('clerk-UNKNOWN'), null);
});
