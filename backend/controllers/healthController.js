const openaiService = require('../services/openaiService');
const { OpenAIError } = require('../utils/errors');

// Basic health check
exports.getHealth = (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'CareerSense API',
    version: '1.0.0',
    env: {
      node: process.version,
      platform: process.platform
    }
  });
};

// Simple ping endpoint
exports.ping = (req, res) => {
  res.json({ 
    message: 'pong',
    timestamp: new Date().toISOString()
  });
};

// Test OpenAI connection
exports.testOpenAI = async (req, res, next) => {
  console.log('Received request to /test-openai');
  try {
    const result = await openaiService.testOpenAIConnection();
    if (result) {
      return res.json({
        status: 'ok',
        message: 'OpenAI connection successful',
        timestamp: new Date().toISOString()
      });
    } else {
      throw new OpenAIError(
        'OpenAI connection failed',
        'Could not establish a connection to the OpenAI service. Please check your API key and network connection.',
        500
      );
    }
  } catch (error) {
    // Pass the error to the error handler middleware
    next(error);
  }
};
