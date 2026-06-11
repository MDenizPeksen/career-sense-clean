const openaiService = require('../services/openaiService');
const { ValidationError, OpenAIError } = require('../utils/errors');

// Get career archetype controller
exports.getArchetype = async (req, res, next) => {
  try {
    const { resumeText } = req.body;
    
    if (!resumeText || resumeText.trim().length < 50) {
      throw new ValidationError(
        'Invalid resume text',
        'Resume text is required and must be at least 50 characters long'
      );
    }
    
    try {
      // Get archetype from OpenAI
      const archetypeResult = await openaiService.getArchetype(resumeText);
      return res.json(archetypeResult);
    } catch (openaiError) {
      throw new OpenAIError(
        'Error during AI analysis',
        openaiError.message,
        openaiError.response ? openaiError.response.status : 500,
        openaiError.response && openaiError.response.data && openaiError.response.data.error ? openaiError.response.data.error.message : ''
      );
    }
  } catch (error) {
    // Pass the error to the error handler middleware
    next(error);
  }
};
