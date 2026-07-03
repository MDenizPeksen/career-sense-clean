'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { validateEnv, stripWrappingQuotes } = require('../config/validateEnv');

// A minimal, self-contained env object so tests never touch process.env or exit
// the test runner. We only assert the pure, non-fatal behavior (normalization
// and warnings); the fatal branch calls process.exit and is covered by review.

test('stripWrappingQuotes removes a matching pair of double quotes', () => {
  assert.equal(stripWrappingQuotes('"postgres://u:p@h/db"'), 'postgres://u:p@h/db');
});

test('stripWrappingQuotes removes a matching pair of single quotes', () => {
  assert.equal(stripWrappingQuotes("'secret'"), 'secret');
});

test('stripWrappingQuotes leaves unquoted values (only trims) intact', () => {
  assert.equal(stripWrappingQuotes('  plain-value  '), 'plain-value');
});

test('stripWrappingQuotes does not strip mismatched or inner quotes', () => {
  assert.equal(stripWrappingQuotes('"unterminated'), '"unterminated');
  assert.equal(stripWrappingQuotes('has"inner"quotes'), 'has"inner"quotes');
});

test('validateEnv de-quotes DATABASE_URL in place', () => {
  const env = {
    NODE_ENV: 'development',
    OPENAI_API_KEY: 'sk-test',
    DATABASE_URL: '"postgres://u:p@h/db?sslmode=require"',
    AUTH_ENABLED: 'false',
  };
  validateEnv(env);
  assert.equal(env.DATABASE_URL, 'postgres://u:p@h/db?sslmode=require');
});

test('validateEnv warns (does not throw) on missing DATABASE_URL in dev', () => {
  const env = {
    NODE_ENV: 'development',
    OPENAI_API_KEY: 'sk-test',
    AUTH_ENABLED: 'false',
  };
  const { warnings } = validateEnv(env);
  assert.ok(warnings.some((w) => w.includes('DATABASE_URL')));
});

test('validateEnv warns on missing CLERK_SECRET_KEY when auth is enabled in dev', () => {
  const env = {
    NODE_ENV: 'development',
    OPENAI_API_KEY: 'sk-test',
    DATABASE_URL: 'postgres://u:p@h/db',
    // AUTH_ENABLED unset -> defaults to enabled
  };
  const { warnings } = validateEnv(env);
  assert.ok(warnings.some((w) => w.includes('CLERK_SECRET_KEY')));
});

test('validateEnv is quiet when dev env is fully configured', () => {
  const env = {
    NODE_ENV: 'development',
    OPENAI_API_KEY: 'sk-test',
    DATABASE_URL: 'postgres://u:p@h/db',
    CLERK_SECRET_KEY: 'sk_clerk',
    AUTH_ENABLED: 'true',
  };
  const { warnings } = validateEnv(env);
  assert.deepEqual(warnings, []);
});
