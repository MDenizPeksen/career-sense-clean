const openaiService = require('../services/openaiService');

/**
 * Generate interview questions based on job role and level
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getInterviewQuestions = async (req, res, next) => {
  try {
    const { role, level } = req.body;
    
    if (!role || !level) {
      return res.status(400).json({
        error: 'Missing required parameters',
        details: 'Both role and level are required'
      });
    }
    
    // Generate interview questions using OpenAI
    const questions = await openaiService.generateInterviewQuestions(role, level);
    
    res.json({
      questions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};
