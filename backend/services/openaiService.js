const { OpenAI } = require('openai');
const openaiConfig = require('../config/openai');
const { OpenAIError, ValidationError } = require('../utils/errors');
const analysisPrompt = require('./prompts/analysisPrompt');
const getArchetypePrompt = require('./prompts/archetypePrompt');
const interviewQuestionsPrompt = require('./prompts/interviewQuestionsPrompt');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: openaiConfig.apiKey
});

// Test OpenAI connection
const testOpenAIConnection = async () => {
  try {
    await openai.chat.completions.create({
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

/**
 * Strip optional markdown fences and JSON.parse the model output.
 * Throws OpenAIError(500) on unparseable content. The default parser for
 * callOpenAIJson; callers with bespoke validation can pass their own.
 * @param {string} content
 * @returns {any}
 */
const parseJsonResponse = (content) => {
  try {
    const cleaned = String(content).replace(/```json\s*|\s*```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (parseError) {
    console.error('Error parsing OpenAI response:', parseError);
    throw new OpenAIError(
      'Error parsing AI response',
      'The AI service returned a response that could not be processed. Please try again.',
      500
    );
  }
};

/**
 * Shared OpenAI chat-completion helper: builds the request in JSON mode, races
 * it against the configured timeout, normalizes API errors to OpenAIError, and
 * parses the result. This is the single place the call + timeout + error-wrap +
 * parse plumbing lives, so each service only owns its prompt + result shaping.
 *
 * @param {object} opts
 * @param {string} [opts.system] - system message (omitted when `messages` given)
 * @param {string} [opts.user] - user message (omitted when `messages` given)
 * @param {Array<{role: string, content: string}>} [opts.messages] - full message
 *   list; takes precedence over system/user (for multi-turn callers)
 * @param {number} opts.maxTokens
 * @param {number} opts.temperature
 * @param {(content: string) => any} [opts.parse] - result parser (default: JSON)
 * @returns {Promise<any>}
 */
const callOpenAIJson = async ({ system, user, messages, maxTokens, temperature, parse = parseJsonResponse }) => {
  const finalMessages = messages || [
    ...(system ? [{ role: 'system', content: system }] : []),
    { role: 'user', content: user },
  ];

  let content;
  try {
    const completionPromise = openai.chat.completions.create({
      model: openaiConfig.model,
      messages: finalMessages,
      max_tokens: maxTokens,
      temperature,
      response_format: { type: 'json_object' },
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new OpenAIError('Request timed out', 'The AI service took too long to respond. Please try again.', 504)),
        openaiConfig.timeout
      );
    });

    const completion = await Promise.race([completionPromise, timeoutPromise]);
    content = completion.choices[0].message.content;
  } catch (error) {
    if (error instanceof OpenAIError) throw error;
    console.error('OpenAI API Error:', error);
    throw new OpenAIError(
      'AI Service Error',
      error.response?.data?.error?.message || error.message,
      error.response?.status || 500
    );
  }

  // Parsing happens outside the try so a parser's own OpenAIError isn't reclassified.
  return parse(content);
};

// Analyze CV with OpenAI
const analyzeCV = async (cvText) => {
  if (!cvText || typeof cvText !== 'string' || cvText.trim().length < 100) {
    throw new ValidationError('Invalid CV text', 'CV text must be a string with at least 100 characters');
  }

  const parsedAnalysis = await callOpenAIJson({
    system: 'You are CareerSense AI, an expert career advisor specializing in resume analysis.',
    user: analysisPrompt(cvText),
    maxTokens: openaiConfig.maxTokens.cv,
    temperature: openaiConfig.temperature.cv,
  });

  // Normalize the shape so the client can render safely, WITHOUT fabricating
  // content. We only ensure containers exist (empty) — every value returned is
  // genuine model output, never invented.
  if (!Array.isArray(parsedAnalysis.role_matching)) {
    parsedAnalysis.role_matching = [];
  }

  if (!parsedAnalysis.resume_optimization || typeof parsedAnalysis.resume_optimization !== 'object') {
    parsedAnalysis.resume_optimization = {};
  }
  if (!Array.isArray(parsedAnalysis.resume_optimization.bullet_rewrites)) {
    parsedAnalysis.resume_optimization.bullet_rewrites = [];
  }
  if (!Array.isArray(parsedAnalysis.resume_optimization.ats_keywords_missing)) {
    parsedAnalysis.resume_optimization.ats_keywords_missing = [];
  }
  if (typeof parsedAnalysis.resume_optimization.formatting_feedback !== 'string') {
    parsedAnalysis.resume_optimization.formatting_feedback = '';
  }

  if (!Array.isArray(parsedAnalysis.personalized_learning_roadmap)) {
    parsedAnalysis.personalized_learning_roadmap = [];
  }

  return parsedAnalysis;
};

// Get career archetype with OpenAI
const getArchetype = async (resumeText) => {
  if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
    throw new ValidationError('Invalid resume text', 'Resume text must be a string with at least 50 characters');
  }

  return callOpenAIJson({
    system: 'You are CareerSense AI, an expert career advisor specializing in career archetype analysis.',
    user: getArchetypePrompt(resumeText),
    maxTokens: openaiConfig.maxTokens.archetype,
    temperature: openaiConfig.temperature.archetype,
  });
};

// Generate interview questions with OpenAI
const generateInterviewQuestions = async (role, level) => {
  if (!role || !level) {
    throw new ValidationError('Role and level are required for generating interview questions');
  }

  const parsedContent = await callOpenAIJson({
    user: interviewQuestionsPrompt(role, level),
    maxTokens: openaiConfig.maxTokens.interview || 1000,
    temperature: openaiConfig.temperature.interview || 0.7,
  });

  // Prefer the documented `questions` key; fall back to a top-level array or the
  // first array-valued property if the model wraps it under another name.
  if (Array.isArray(parsedContent.questions)) {
    return parsedContent.questions;
  }
  if (Array.isArray(parsedContent)) {
    return parsedContent;
  }
  const firstArray = Object.values(parsedContent).find((v) => Array.isArray(v));
  return firstArray || [];
};

module.exports = {
  openai,
  callOpenAIJson,
  parseJsonResponse,
  testOpenAIConnection,
  analyzeCV,
  getArchetype,
  generateInterviewQuestions,
  analysisPrompt,
  getArchetypePrompt
};
