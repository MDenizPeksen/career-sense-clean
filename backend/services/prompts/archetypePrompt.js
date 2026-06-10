// Prompt template for GPT archetype classification.
module.exports = function getArchetypePrompt(resumeText) {
  return `
You are CareerSense AI, an expert in career development and professional archetypes.

Based on the resume text provided, identify the primary and secondary career archetypes that best describe this professional. Consider their experience, skills, achievements, and the language they use to describe themselves.

Resume Text:
"""
${resumeText}
"""

Return ONLY a valid JSON object with the following structure:
{
  "primary": {
    "archetype": "Name of the primary archetype",
    "confidence": "High/Medium/Low",
    "description": "Brief description of this archetype",
    "strengths": ["3-5 key strengths of this archetype"],
    "challenges": ["2-3 common challenges for this archetype"],
    "careerPaths": ["3-5 suitable career paths for this archetype"],
    "developmentAreas": ["2-3 areas for professional growth"]
  },
  "secondary": {
    "archetype": "Name of the secondary archetype",
    "confidence": "High/Medium/Low",
    "description": "Brief description of this archetype",
    "strengths": ["2-3 key strengths of this archetype"],
    "challenges": ["1-2 common challenges for this archetype"]
  },
  "explanation": "Brief explanation of why these archetypes were selected based on the resume"
}

Ensure your response is ONLY the JSON object with no additional text before or after.
`;
};
