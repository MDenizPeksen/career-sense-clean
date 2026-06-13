'use strict';

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

  const contact =
    raw.contact && typeof raw.contact === 'object' && !Array.isArray(raw.contact)
      ? raw.contact
      : {};

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
    ...(certifications !== undefined ? { certifications } : {}),
    ...(languages !== undefined ? { languages } : {}),
  };
}

module.exports = { normalizeParsedCV };
