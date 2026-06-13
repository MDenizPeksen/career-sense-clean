/**
 * Prompt for the structured CV extraction stage (Phase 2.1).
 * Low temperature (0.1) — this is extraction, not generation.
 * Verbatim bullets are critical: the analysis stage cites them as evidence.
 */
module.exports = function cvParsePrompt(rawText) {
  return `Extract structured information from the following CV/resume text into JSON.

Resume Text:
"""
${rawText}
"""

Return ONLY a valid JSON object with this exact structure:
{
  "contact": {
    "name": "Full name as written, or null",
    "email": "Email address or null",
    "phone": "Phone number or null",
    "location": "City, Country format or null",
    "linkedin": "Full LinkedIn URL or null",
    "portfolio_url": "Portfolio or personal website URL or null"
  },
  "summary": "Professional summary paragraph verbatim if present, otherwise null",
  "experience": [
    {
      "title": "Job title",
      "company": "Company or organisation name",
      "location": "City, Country or null",
      "start_date": "YYYY-MM or YYYY or null",
      "end_date": "YYYY-MM or YYYY or 'Present' or null",
      "bullets": ["Achievement or responsibility copied verbatim from the CV", "..."]
    }
  ],
  "education": [
    {
      "degree": "Full degree name (e.g. 'Bachelor of Science', 'MSc', 'MBA')",
      "field": "Field of study or null",
      "institution": "University or school name",
      "start_date": "YYYY or null",
      "end_date": "YYYY or null"
    }
  ],
  "skills": ["skill1", "skill2"],
  "certifications": ["certification name"] or null,
  "languages": ["English", "German"] or null
}

Rules:
- List experience in reverse-chronological order (most recent first)
- Copy bullets VERBATIM from the CV — do NOT rewrite, summarise, or invent new content
- Use null for any field not found in the CV
- Return ONLY the JSON object, no other text`;
};
