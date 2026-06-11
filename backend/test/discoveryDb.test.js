'use strict';

// Verifies the discovery write helpers enforce ownership themselves — a
// defense-in-depth backstop so a caller that forgets to check ownership can
// still never write to (or complete) another user's session.

const test = require('node:test');
const assert = require('node:assert/strict');

// Fake data: session 's1' is owned by user 'userA'.
const SESSIONS = { s1: { id: 's1', userId: 'userA' } };
const USERS = { 'clerk-A': { id: 'userA' }, 'clerk-B': { id: 'userB' } };

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
      discoverySession: {
        // updateMany only touches rows matching BOTH id and userId — so a
        // non-owner's scoped update affects 0 rows.
        updateMany: async ({ where: { id, userId } }) => {
          const s = SESSIONS[id];
          return { count: s && s.userId === userId ? 1 : 0 };
        },
      },
      message: {
        create: async ({ data }) => ({ id: 'm1', createdAt: new Date(), ...data }),
      },
    },
  },
};

const { addMessage, completeSession } = require('../db/discovery');

test('addMessage: owner can append to their own session', async () => {
  const msg = await addMessage('clerk-A', 's1', 'user', 'hello');
  assert.equal(msg.sessionId, 's1');
  assert.equal(msg.content, 'hello');
});

test('addMessage: a different user CANNOT append to someone else\'s session', async () => {
  await assert.rejects(
    () => addMessage('clerk-B', 's1', 'user', 'sneaky'),
    /not found/i
  );
});

test('addMessage: unknown user is rejected', async () => {
  await assert.rejects(() => addMessage('clerk-ghost', 's1', 'user', 'x'), /not found/i);
});

test('completeSession: owner can complete their own session', async () => {
  await assert.doesNotReject(() => completeSession('clerk-A', 's1', { goal: 'x' }));
});

test('completeSession: a different user CANNOT complete someone else\'s session', async () => {
  await assert.rejects(
    () => completeSession('clerk-B', 's1', { goal: 'x' }),
    /not found/i
  );
});
