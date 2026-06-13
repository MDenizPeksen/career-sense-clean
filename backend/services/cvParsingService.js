'use strict';

const { callOpenAIJson } = require('./openaiService');
const { ValidationError } = require('../utils/errors');
const cvParsePrompt = require('./prompts/cvParsePrompt');
const openaiConfig = require('../config/openai');

/**
 * @typedef {{ name?: string, email?: string, phone?: string, location?: string, linkedin?: string, portfolio_url?: string }} CvContact
 * @typedef {{ title: string, company: string, location?: string, start_date?: string, end_date?: string, bullets: string[] }} CvExperience
 * @typedef {{ degree: string, field?: string, institution: string, start_date?: string, end_date?: string }} CvEducation
 * @typedef {{ contact: CvContact, summary?: string, experience: CvExperience[], education: CvEducation[], skills: string[], certifications?: string[], languages?: string[] }} ParsedCV
 */

/**
 * Normalize raw LLM JSON into a clean ParsedCV.
 * Defensive — never throws; always returns a structurally valid shape.
 * Exported for unit testing.
 * @param {any} raw
 * @returns {ParsedCV}
 */
function normalizeParsedCV(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { contact: {}, experience: [], education: [], skills: [] };
  }

  const rawContact =
    raw.contact && typeof raw.contact === 'object' && !Array.isArray(raw.contact)
      ? raw.contact
      : {};
  const contact = {};
  for (const [k, v] of Object.entries(rawContact)) {
    if (typeof v === 'string' && v.trim()) contact[k] = v.trim();
  }

  const summary =
    typeof raw.summary === 'string' && raw.summary.trim()
      ? raw.summary.trim()
      : undefined;

  const experience = Array.isArray(raw.experience)
    ? raw.experience
        .filter((e) => e && typeof e === 'object')
        .map((e) => ({
          title: typeof e.title === 'string' ? e.title.trim() : '',
          company: typeof e.company === 'string' ? e.company.trim() : '',
          ...(typeof e.location === 'string' && e.location.trim()
            ? { location: e.location.trim() } : {}),
          ...(typeof e.start_date === 'string' && e.start_date.trim()
            ? { start_date: e.start_date.trim() } : {}),
          ...(typeof e.end_date === 'string' && e.end_date.trim()
            ? { end_date: e.end_date.trim() } : {}),
          bullets: Array.isArray(e.bullets)
            ? e.bullets
                .filter((b) => typeof b === 'string' && b.trim())
                .map((b) => b.trim())
            : [],
        }))
    : [];

  const education = Array.isArray(raw.education)
    ? raw.education
        .filter((e) => e && typeof e === 'object')
        .map((e) => ({
          degree: typeof e.degree === 'string' ? e.degree.trim() : '',
          ...(typeof e.field === 'string' && e.field.trim()
            ? { field: e.field.trim() } : {}),
          institution: typeof e.institution === 'string' ? e.institution.trim() : '',
          ...(typeof e.start_date === 'string' && e.start_date.trim()
            ? { start_date: e.start_date.trim() } : {}),
          ...(typeof e.end_date === 'string' && e.end_date.trim()
            ? { end_date: e.end_date.trim() } : {}),
        }))
    : [];

  const skills = Array.isArray(raw.skills)
    ? raw.skills.filter((s) => typeof s === 'string' && s.trim()).map((s) => s.trim())
    : [];

  const certifications = Array.isArray(raw.certifications)
    ? raw.certifications.filter((s) => typeof s === 'string' && s.trim()).map((s) => s.trim())
    : undefined;

  const languages = Array.isArray(raw.languages)
    ? raw.languages.filter((s) => typeof s === 'string' && s.trim()).map((s) => s.trim())
    : undefined;

  return {
    contact,
    ...(summary !== undefined ? { summary } : {}),
    experience,
    education,
    skills,
    ...(certifications && certifications.length > 0 ? { certifications } : {}),
    ...(languages && languages.length > 0 ? { languages } : {}),
  };
}

/**
 * Convert a ParsedCV into a structured text string for the analysis prompt.
 * Clear section headers and bullet formatting let gpt-4o-mini reliably
 * identify sections, roles, and achievements without re-discovering structure.
 * Pure — no I/O. Exported for unit testing.
 * @param {ParsedCV} cv
 * @returns {string}
 */
function parsedCvToText(cv) {
  if (!cv || typeof cv !== 'object') return '';
  const sections = [];

  // CONTACT
  const c = cv.contact || {};
  const contactLines = ['=== CONTACT ==='];
  if (c.name) contactLines.push(`Name: ${c.name}`);
  if (c.email) contactLines.push(`Email: ${c.email}`);
  if (c.phone) contactLines.push(`Phone: ${c.phone}`);
  if (c.location) contactLines.push(`Location: ${c.location}`);
  if (c.linkedin) contactLines.push(`LinkedIn: ${c.linkedin}`);
  if (c.portfolio_url) contactLines.push(`Portfolio: ${c.portfolio_url}`);
  sections.push(contactLines.join('\n'));

  // PROFESSIONAL SUMMARY
  if (cv.summary) {
    sections.push(`=== PROFESSIONAL SUMMARY ===\n${cv.summary}`);
  }

  // WORK EXPERIENCE
  if (cv.experience && cv.experience.length > 0) {
    const expLines = ['=== WORK EXPERIENCE ==='];
    for (const exp of cv.experience) {
      if (!exp.title && !exp.company) continue;
      const parts = [exp.title, exp.company];
      if (exp.location) parts.push(exp.location);
      if (exp.start_date || exp.end_date) {
        parts.push(`${exp.start_date || '?'} – ${exp.end_date || 'Present'}`);
      }
      expLines.push(parts.join(' | '));
      for (const bullet of (exp.bullets || [])) {
        expLines.push(`• ${bullet}`);
      }
      expLines.push('');
    }
    if (expLines.length > 1) sections.push(expLines.join('\n').trimEnd());
  }

  // EDUCATION
  if (cv.education && cv.education.length > 0) {
    const eduLines = ['=== EDUCATION ==='];
    for (const edu of cv.education) {
      const degreePart = edu.field ? `${edu.degree} in ${edu.field}` : edu.degree;
      const parts = [degreePart, edu.institution];
      if (edu.start_date || edu.end_date) {
        parts.push(`${edu.start_date || '?'} – ${edu.end_date || '?'}`);
      }
      eduLines.push(parts.join(' | '));
    }
    sections.push(eduLines.join('\n'));
  }

  // SKILLS
  if (cv.skills && cv.skills.length > 0) {
    sections.push(`=== SKILLS ===\n${cv.skills.join(', ')}`);
  }

  // CERTIFICATIONS
  if (cv.certifications && cv.certifications.length > 0) {
    const certLines = ['=== CERTIFICATIONS ==='];
    for (const cert of cv.certifications) certLines.push(`• ${cert}`);
    sections.push(certLines.join('\n'));
  }

  // LANGUAGES
  if (cv.languages && cv.languages.length > 0) {
    sections.push(`=== LANGUAGES ===\n${cv.languages.join(', ')}`);
  }

  return sections.join('\n\n');
}

/**
 * Parse raw CV text into a structured ParsedCV using gpt-4o-mini.
 * One cheap, low-temperature call — extraction only, no invented content.
 * @param {string} rawText
 * @returns {Promise<ParsedCV>}
 */
async function parseCvStructure(rawText) {
  if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 50) {
    throw new ValidationError(
      'Invalid CV text',
      'CV text must be a string with at least 50 characters'
    );
  }
  const raw = await callOpenAIJson({
    system: 'You are a precise CV data extractor. Return only valid JSON matching the requested schema.',
    user: cvParsePrompt(rawText),
    maxTokens: openaiConfig.maxTokens.parse,
    temperature: openaiConfig.temperature.parse,
  });
  return normalizeParsedCV(raw);
}

module.exports = { normalizeParsedCV, parsedCvToText, parseCvStructure };
