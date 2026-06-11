// Prompt template for the full CV analysis (/analyze).
module.exports = function analysisPrompt(cvText) {
  return `
You are CareerSense AI, an expert career advisor specializing in resume analysis.

I'll provide you with the text extracted from a resume/CV. Your task is to analyze it thoroughly and provide structured insights that will help the person improve their career prospects.

Resume Text:
"""
${cvText}
"""

Return ONLY a valid JSON object with the following structure, closely adhering to the descriptions:
{
  "user_profile": {
    "name": "Full name if found, otherwise 'Not specified'",
    "current_role": "Current or most recent professional title",
    "sector": "Industry sector the person works in (e.g., Technology, Healthcare, Finance)",
    "location": "Geographic location or city/country if found",
    "years_experience": "Estimated total years of experience (number)",
    "education": [
      ["Degree level (e.g., Bachelor's, Master's, Ph.D.)", "Field of study", "Institution name"],
      // Include all degrees separately as nested arrays
    ],
    "skills": ["Array of technical and soft skills identified"],
    "industries": ["Array of industries the person has worked in"],
    "email": "Email address if found",
    "linkedin": "LinkedIn profile URL if found",
    "portfolio_url": "Portfolio URL if found"
  },
  "profile_strengths": {
    "skills": ["Top 5-7 key technical and soft skills extracted directly"],
    "core_competencies": ["3-5 core competencies derived from experience descriptions"],
    "achievements": ["List 2-3 quantifiable achievements if mentioned"]
  },
  "analysis": {
    "strengths": ["3-5 key strengths summary based on experience and skills"],
    "improvement_areas": ["2-3 areas that could be improved in the resume content or presentation"],
    "missing_elements": ["Important elements missing from the resume (e.g., summary, metrics)"],
    "keyword_optimization": ["Suggestions for 3-5 industry-relevant keywords to add"],
    "recommended_roles": ["3-5 specific job titles that match their experience and skills"]
  },
  "role_matching": [
    {
      "role": "First specific job title that matches their experience",
      "match_percentage": 85, // Number between 0-100 representing match quality
      "transition_difficulty": "Easy/Moderate/Challenging", // Difficulty to transition to this role
      "required_skills": ["Array of 5-7 key skills needed for this role"],
      "role_description": "Brief 1-2 sentence description of what this role entails",
      "salary_range": "Estimated salary range for this role (e.g., '50,000 - 70,000')"
    },
    {
      "role": "Second specific job title that matches their experience",
      "match_percentage": 75, // Number between 0-100 representing match quality
      "transition_difficulty": "Easy/Moderate/Challenging", // Difficulty to transition to this role
      "required_skills": ["Array of 5-7 key skills needed for this role"],
      "role_description": "Brief 1-2 sentence description of what this role entails",
      "salary_range": "Estimated salary range for this role (e.g., '50,000 - 70,000')"
    },
    {
      "role": "Third specific job title that matches their experience",
      "match_percentage": 65, // Number between 0-100 representing match quality
      "transition_difficulty": "Easy/Moderate/Challenging", // Difficulty to transition to this role
      "required_skills": ["Array of 5-7 key skills needed for this role"],
      "role_description": "Brief 1-2 sentence description of what this role entails",
      "salary_range": "Estimated salary range for this role (e.g., '50,000 - 70,000')"
    }
  ],
  "resume_optimization": {
    "bullet_rewrites": [
      { "original": "Original bullet point from resume", "optimized": "Rewritten bullet point focusing on impact and metrics" },
      { "original": "Second original bullet point from resume", "optimized": "Second rewritten bullet point demonstrating quantifiable achievements and leadership impact" }
    ],
    "ats_keywords_missing": ["List 3-5 relevant keywords missing for ATS optimization"],
    "formatting_feedback": "Brief assessment (1-2 sentences) of resume structure, layout, and formatting consistency. Combine insights from previous structure/content/impact fields.",
    "general_recommendations": ["2-3 high-level recommendations for improvement not covered above"]
  },
  "star_interview_stories": [
    {
      "title": "Brief title for the story (e.g., 'Led Marketing Campaign')",
      "situation": "Describe the situation or context.",
      "task": "What was the specific task or goal?",
      "action": "What actions did the person take?",
      "result": "What were the quantifiable results or outcomes?"
    }
  ],
  "personalized_learning_roadmap": [
    {
      "course": "Name of a recommended course or skill area",
      "platform": "Suggested platform (e.g., Coursera, Udemy, LinkedIn Learning)",
      "impact": "How this course helps bridge skill gaps or achieve career goals",
      "difficulty": "Estimated difficulty (Beginner, Intermediate, Advanced)",
      "duration": "Estimated time commitment (e.g., '10 hours', '4 weeks')"
    }
  ],
  "future_growth_potential": {
    "career_growth_trajectory": "Describe potential career progression paths (1-2 sentences)",
    "skills_forecast": ["Identify 2-3 skills becoming crucial in their target roles/industry"],
    "industry_insights": ["Provide 1-2 brief insights about trends in their target industry"]
  },
  "career_development_insights": {
    "strengths_leverage": "How to best leverage their core strengths in job applications/interviews (1-2 sentences)",
    "networking_strategy": "Suggest 1-2 specific networking approaches relevant to their field",
    "personal_branding_tips": "Offer 1-2 actionable tips for improving their personal brand online (e.g., LinkedIn)"
  },
  "recruiter_friendly_summary": "A concise 5 sentence professional summary that could be used at the top of a resume.",
  "archetype": {
    "primary": "The primary career archetype that best describes this person",
    "secondary": "A secondary career archetype that also fits",
    "description": "Brief explanation of why these archetypes fit",
    "strengths": ["Key strengths associated with these archetypes"],
    "growthAreas": ["Growth areas associated with these archetypes"]
  }
}

IMPORTANT: You MUST provide EXACTLY 3 roles in the role_matching array, each with a different role title, match percentage, and transition difficulty. Make sure each role has a detailed description, required skills, and salary range.

Ensure your response is ONLY the JSON object with no additional text before or after. Adhere strictly to the requested keys and structure.
`;
};
