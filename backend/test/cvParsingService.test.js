'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeParsedCV } = require('../services/cvParsingService');

test('normalizeParsedCV: returns safe defaults for null/non-object/array', () => {
  const empty = { contact: {}, experience: [], education: [], skills: [] };
  assert.deepEqual(normalizeParsedCV(null), empty);
  assert.deepEqual(normalizeParsedCV('bad input'), empty);
  assert.deepEqual(normalizeParsedCV(undefined), empty);
  assert.deepEqual(normalizeParsedCV([]), empty);
});

test('normalizeParsedCV: passes through a well-formed object', () => {
  const raw = {
    contact: { name: 'Jane Smith', email: 'jane@example.com' },
    summary: 'Experienced engineer.',
    experience: [
      {
        title: 'Engineer', company: 'Acme', location: 'Berlin',
        start_date: '2020-01', end_date: 'Present',
        bullets: ['Built X', 'Led Y'],
      },
    ],
    education: [
      { degree: 'MSc', field: 'Computer Science', institution: 'TU Berlin', start_date: '2016', end_date: '2018' },
    ],
    skills: ['Python', 'JavaScript'],
    certifications: ['AWS SAA'],
    languages: ['English', 'German'],
  };
  const result = normalizeParsedCV(raw);
  assert.equal(result.contact.name, 'Jane Smith');
  assert.equal(result.summary, 'Experienced engineer.');
  assert.equal(result.experience.length, 1);
  assert.equal(result.experience[0].title, 'Engineer');
  assert.deepEqual(result.experience[0].bullets, ['Built X', 'Led Y']);
  assert.equal(result.education.length, 1);
  assert.deepEqual(result.skills, ['Python', 'JavaScript']);
  assert.deepEqual(result.certifications, ['AWS SAA']);
  assert.deepEqual(result.languages, ['English', 'German']);
});

test('normalizeParsedCV: trims whitespace and filters malformed entries', () => {
  const raw = {
    contact: {},
    experience: [
      null,
      { title: '  Engineer  ', company: '  Acme  ', bullets: [' Built X ', 42, null, ''] },
      { title: '', company: '', bullets: [] },
    ],
    education: [],
    skills: ['Python', '', null, 42, 'JavaScript'],
  };
  const result = normalizeParsedCV(raw);
  assert.equal(result.experience.length, 2);
  assert.equal(result.experience[0].title, 'Engineer');
  assert.equal(result.experience[0].company, 'Acme');
  assert.deepEqual(result.experience[0].bullets, ['Built X']);
  assert.deepEqual(result.skills, ['Python', 'JavaScript']);
});

test('normalizeParsedCV: omits optional fields when absent from input', () => {
  const raw = { contact: {}, experience: [], education: [], skills: [] };
  const result = normalizeParsedCV(raw);
  assert.equal(result.summary, undefined);
  assert.equal(result.certifications, undefined);
  assert.equal(result.languages, undefined);
});

test('normalizeParsedCV: strips null and non-string values from contact', () => {
  const raw = {
    contact: { name: 'Alice', email: null, phone: undefined, location: '', linkedin: 'https://linkedin.com/in/alice' },
    experience: [], education: [], skills: [],
  };
  const result = normalizeParsedCV(raw);
  assert.equal(result.contact.name, 'Alice');
  assert.equal(result.contact.linkedin, 'https://linkedin.com/in/alice');
  assert.equal(result.contact.email, undefined);
  assert.equal(result.contact.phone, undefined);
  assert.equal(result.contact.location, undefined);
});

test('normalizeParsedCV: contact is a copy, not a reference', () => {
  const raw = {
    contact: { name: 'Alice', email: 'alice@example.com' },
    experience: [], education: [], skills: [],
  };
  const result = normalizeParsedCV(raw);
  result.contact.name = 'Mutated';
  assert.equal(raw.contact.name, 'Alice'); // original must be unchanged
});

test('normalizeParsedCV: empty certifications and languages arrays produce undefined', () => {
  const raw = { contact: {}, experience: [], education: [], skills: [], certifications: [], languages: [] };
  const result = normalizeParsedCV(raw);
  assert.equal(result.certifications, undefined);
  assert.equal(result.languages, undefined);
});
