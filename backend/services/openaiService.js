const { OpenAI } = require('openai');
const openaiConfig = require('../config/openai');
const { OpenAIError, ValidationError } = require('../utils/errors');
const getArchetypePrompt = require('./archetypePrompt');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: openaiConfig.apiKey
});

// Test OpenAI connection
const testOpenAIConnection = async () => {
  try {
    const response = await openai.chat.completions.create({
      model: openaiConfig.model,
      messages: [{ role: "user", content: "Hello, this is a test connection." }],
      max_tokens: openaiConfig.maxTokens.test
    });
    console.log('✅ OpenAI connection successful');
    return true;
  } catch (error) {
    console.error('❌ OpenAI connection failed:', error.message);
    return false;
  }
};

// Generate CV analysis prompt
const analysisPrompt = (cvText) => `
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

// Analyze CV with OpenAI
const analyzeCV = async (cvText) => {
  if (!cvText || typeof cvText !== 'string' || cvText.trim().length < 100) {
    throw new ValidationError('Invalid CV text', 'CV text must be a string with at least 100 characters');
  }

  try {
    // Call OpenAI API
    const completionPromise = openai.chat.completions.create({
      model: openaiConfig.model,
      messages: [
        { 
          role: "system", 
          content: "You are CareerSense AI, an expert career advisor specializing in resume analysis." 
        },
        { 
          role: "user", 
          content: analysisPrompt(cvText) 
        }
      ],
      max_tokens: openaiConfig.maxTokens.cv,
      temperature: openaiConfig.temperature.cv
    });
    
    // Add timeout to the promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new OpenAIError('Request timed out', 'The AI service took too long to respond. Please try again.', 504)), 
        openaiConfig.timeout);
    });
    
    // Race the promises
    const completion = await Promise.race([completionPromise, timeoutPromise]);
    
    // Extract the response content
    const analysis = completion.choices[0].message.content;
    
    try {
      // Remove any markdown code block formatting if present
      let cleanedAnalysis = analysis.replace(/```json\s*|\s*```/g, '');
      cleanedAnalysis = cleanedAnalysis.trim();
      
      // Parse the JSON response
      const parsedAnalysis = JSON.parse(cleanedAnalysis);
      
      // Ensure role_matching always has exactly 3 roles
      if (!parsedAnalysis.role_matching || !Array.isArray(parsedAnalysis.role_matching)) {
        parsedAnalysis.role_matching = [];
      }
      
      // If we have fewer than 3 roles, generate additional ones based on recommended_roles or add defaults
      if (parsedAnalysis.role_matching.length < 3) {
        console.log(`OpenAI returned only ${parsedAnalysis.role_matching.length} roles. Adding fallback roles to ensure 3 roles total.`);
        
        // Try to use recommended_roles as a source for additional roles
        const recommendedRoles = parsedAnalysis.analysis && 
                                parsedAnalysis.analysis.recommended_roles && 
                                Array.isArray(parsedAnalysis.analysis.recommended_roles) ? 
                                parsedAnalysis.analysis.recommended_roles : [];
        
        // Default roles to use if we don't have enough from recommended_roles
        const defaultRoles = [
          "Business Analyst", 
          "Product Manager", 
          "Data Analyst", 
          "Project Manager", 
          "Marketing Specialist"
        ];
        
        // Skills that might be relevant for the default roles
        const defaultSkills = [
          ["Data Analysis", "Requirements Gathering", "Process Modeling", "SQL", "Business Acumen"],
          ["Product Strategy", "User Experience", "Agile Methodologies", "Stakeholder Management", "Market Research"],
          ["Data Visualization", "Statistical Analysis", "SQL", "Excel", "Critical Thinking"],
          ["Project Planning", "Team Leadership", "Risk Management", "Stakeholder Communication", "Agile/Scrum"],
          ["Digital Marketing", "Content Strategy", "Social Media", "Analytics", "Campaign Management"]
        ];
        
        // Get skills from the CV analysis to use in role descriptions
        const userSkills = parsedAnalysis.profile_strengths && 
                          parsedAnalysis.profile_strengths.skills && 
                          Array.isArray(parsedAnalysis.profile_strengths.skills) ? 
                          parsedAnalysis.profile_strengths.skills : [];
        
        // Add roles until we have 3
        while (parsedAnalysis.role_matching.length < 3) {
          const index = parsedAnalysis.role_matching.length;
          const roleSource = recommendedRoles.length > index ? 
                            recommendedRoles[index] : 
                            defaultRoles[index % defaultRoles.length];
          
          // Create a new role with decreasing match percentage
          parsedAnalysis.role_matching.push({
            role: roleSource,
            match_percentage: Math.max(85 - (index * 10), 55), // Decrease match percentage for each role, minimum 55%
            transition_difficulty: index === 0 ? "Easy" : index === 1 ? "Moderate" : "Challenging",
            required_skills: defaultSkills[index % defaultSkills.length],
            role_description: `${roleSource} professionals help organizations improve efficiency and achieve business objectives through ${index === 0 ? "strategic planning" : index === 1 ? "process optimization" : "data-driven decision making"}.`,
            salary_range: `${50 + (index * 5)},000 - ${70 + (index * 10)},000`
          });
        }
      }
      
      // Ensure resume_optimization exists
      if (!parsedAnalysis.resume_optimization) {
        parsedAnalysis.resume_optimization = {
          bullet_rewrites: [],
          ats_keywords_missing: ["Communication", "Leadership", "Project Management"],
          formatting_feedback: "The resume has a clear structure, but could benefit from consistent formatting and section headings to improve readability."
        };
      }
      
      // Ensure bullet_rewrites is an array
      if (!parsedAnalysis.resume_optimization.bullet_rewrites || !Array.isArray(parsedAnalysis.resume_optimization.bullet_rewrites)) {
        parsedAnalysis.resume_optimization.bullet_rewrites = [];
      }
      
      // If we have fewer than 2 bullet rewrites, add default ones
      if (parsedAnalysis.resume_optimization.bullet_rewrites.length < 2) {
        console.log(`OpenAI returned only ${parsedAnalysis.resume_optimization.bullet_rewrites.length} bullet rewrites. Adding fallback bullet rewrites to ensure 2 total.`);
        
        // Default bullet point rewrites to use if we don't have enough
        const defaultBulletRewrites = [
          {
            original: "Managed a team of 5 developers for the company's main product",
            optimized: "Led cross-functional team of 5 developers to deliver 30% performance improvements for the company's flagship product, resulting in $1.2M increased annual revenue"
          },
          {
            original: "Responsible for client communication and project updates",
            optimized: "Established structured client communication framework that increased satisfaction scores by 25% and improved project delivery timelines by 15%"
          }
        ];
        
        // Add bullet rewrites until we have 2
        while (parsedAnalysis.resume_optimization.bullet_rewrites.length < 2) {
          const index = parsedAnalysis.resume_optimization.bullet_rewrites.length;
          parsedAnalysis.resume_optimization.bullet_rewrites.push(defaultBulletRewrites[index]);
        }
      }
      
      // Ensure personalized_learning_roadmap exists and has 3 items
      if (!parsedAnalysis.personalized_learning_roadmap || !Array.isArray(parsedAnalysis.personalized_learning_roadmap)) {
        parsedAnalysis.personalized_learning_roadmap = [];
      }
      
      // If we have fewer than 3 learning roadmap items, add default ones
      if (parsedAnalysis.personalized_learning_roadmap.length < 3) {
        console.log(`OpenAI returned only ${parsedAnalysis.personalized_learning_roadmap.length} learning roadmap items. Adding fallback items to ensure 3 total.`);
        
        // Get skills from the CV analysis to use in learning recommendations
        const userSkills = parsedAnalysis.profile_strengths && 
                          parsedAnalysis.profile_strengths.skills && 
                          Array.isArray(parsedAnalysis.profile_strengths.skills) ? 
                          parsedAnalysis.profile_strengths.skills : [];
        
        // Default learning roadmap items
        const defaultLearningItems = [
          {
            course: "Data Analysis and Visualization with Python",
            platform: "Coursera",
            impact: "This course will enhance your data analysis skills and improve your ability to visualize data effectively.",
            difficulty: "Intermediate",
            duration: "4 weeks"
          },
          {
            course: "Strategic Leadership and Management",
            platform: "LinkedIn Learning",
            impact: "Develop essential leadership skills to advance your career and lead teams more effectively.",
            difficulty: "Intermediate",
            duration: "6 weeks"
          },
          {
            course: "Advanced Excel for Business Analytics",
            platform: "Udemy",
            impact: "Master advanced Excel functions and data analysis techniques that are highly valued in business environments.",
            difficulty: "Beginner to Intermediate",
            duration: "3 weeks"
          }
        ];
        
        // Add learning roadmap items until we have 3
        while (parsedAnalysis.personalized_learning_roadmap.length < 3) {
          const index = parsedAnalysis.personalized_learning_roadmap.length;
          parsedAnalysis.personalized_learning_roadmap.push(defaultLearningItems[index]);
        }
      }
      
      return parsedAnalysis;
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new OpenAIError(
        'Error parsing AI response', 
        'The AI service returned a response that could not be processed. Please try again.',
        500
      );
    }
  } catch (error) {
    // If it's already our custom error, just rethrow it
    if (error instanceof OpenAIError) {
      throw error;
    }
    
    // Handle OpenAI API errors
    console.error('OpenAI API Error:', error);
    throw new OpenAIError(
      'AI Service Error',
      error.response?.data?.error?.message || error.message,
      error.response?.status || 500
    );
  }
};

// Get career archetype with OpenAI
const getArchetype = async (resumeText) => {
  if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
    throw new ValidationError('Invalid resume text', 'Resume text must be a string with at least 50 characters');
  }

  try {
    // Call OpenAI API
    const completionPromise = openai.chat.completions.create({
      model: openaiConfig.model,
      messages: [
        { 
          role: "system", 
          content: "You are CareerSense AI, an expert career advisor specializing in career archetype analysis." 
        },
        { 
          role: "user", 
          content: getArchetypePrompt(resumeText) 
        }
      ],
      max_tokens: openaiConfig.maxTokens.archetype,
      temperature: openaiConfig.temperature.archetype
    });
    
    // Add timeout to the promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new OpenAIError('Request timed out', 'The AI service took too long to respond. Please try again.', 504)), 
        openaiConfig.timeout);
    });
    
    // Race the promises
    const completion = await Promise.race([completionPromise, timeoutPromise]);
    
    // Extract the response content
    const analysis = completion.choices[0].message.content;
    
    try {
      // Remove any markdown code block formatting if present
      let cleanedAnalysis = analysis.replace(/```json\s*|\s*```/g, '');
      cleanedAnalysis = cleanedAnalysis.trim();
      
      // Parse the JSON response
      const parsedAnalysis = JSON.parse(cleanedAnalysis);
      
      return parsedAnalysis;
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new OpenAIError(
        'Error parsing AI response', 
        'The AI service returned a response that could not be processed. Please try again.',
        500
      );
    }
  } catch (error) {
    // If it's already our custom error, just rethrow it
    if (error instanceof OpenAIError) {
      throw error;
    }
    
    // Handle OpenAI API errors
    console.error('OpenAI API Error:', error);
    throw new OpenAIError(
      'AI Service Error',
      error.response?.data?.error?.message || error.message,
      error.response?.status || 500
    );
  }
};

// Generate interview questions prompt
const interviewQuestionsPrompt = (role, level) => `
You are CareerSense AI, an expert career advisor specializing in technical interviews.

Generate a set of 5 interview questions for a ${role} position at the ${level} level. Include a mix of:
- Technical questions specific to the role
- Behavioral questions to assess soft skills
- Problem-solving scenarios relevant to the position

For each question, include:
- The question text
- The category (Technical, Behavioral, Problem-solving)
- The difficulty level (Easy, Medium, Hard)

Format your response as a structured JSON array of questions.
`;

// Generate interview questions with OpenAI
const generateInterviewQuestions = async (role, level) => {
  if (!role || !level) {
    throw new ValidationError('Role and level are required for generating interview questions');
  }

  try {
    const prompt = interviewQuestionsPrompt(role, level);
    
    const response = await openai.chat.completions.create({
      model: openaiConfig.model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: openaiConfig.maxTokens.interview || 1000,
      temperature: openaiConfig.temperature.interview || 0.7,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    
    try {
      const parsedContent = JSON.parse(content);
      return parsedContent.questions || [];
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new OpenAIError(
        'Failed to parse interview questions',
        'The AI generated an invalid response format. Please try again.',
        500
      );
    }
  } catch (error) {
    console.error('Error generating interview questions:', error);
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new OpenAIError(
      'Failed to generate interview questions',
      error.message || 'An error occurred while generating interview questions',
      error.status || 500
    );
  }
};

module.exports = {
  openai,
  testOpenAIConnection,
  analyzeCV,
  getArchetype,
  generateInterviewQuestions,
  analysisPrompt,
  getArchetypePrompt
};
