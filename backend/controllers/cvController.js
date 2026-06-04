const openaiService = require('../services/openaiService');
const fileService = require('../services/fileProcessingService');
const { ValidationError } = require('../utils/errors');
const { getRequestUserId } = require('../middleware/authMiddleware');
const { saveAnalysis, getLatestAnalysis } = require('../db/analyses');

// CV analysis controller
exports.analyzeCV = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ValidationError('No file uploaded', 'Please upload a file to analyze');
    }

    const filePath = req.file.path;
    console.log(`Processing file: ${filePath}`);

    try {
      // Extract text from file
      const cvText = await fileService.extractTextFromFile(req.file);

      // Analyze CV with OpenAI
      const analysis = await openaiService.analyzeCV(cvText);

      // Best-effort persistence: never let a DB hiccup fail the analysis response.
      const userId = getRequestUserId(req);
      if (userId) {
        saveAnalysis(userId, analysis).catch((err) =>
          console.error('Failed to persist analysis:', err.message)
        );
      }

      return res.json(analysis);
    } finally {
      // Always clean up the uploaded temp file, on success or failure.
      if (filePath) {
        fileService.deleteFile(filePath);
      }
    }
  } catch (error) {
    // Pass the error to the error handler middleware
    next(error);
  }
};

// Return the signed-in user's most recent analysis (or null).
exports.getLatestAnalysis = async (req, res, next) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.json({ analysis: null });
    }
    const analysis = await getLatestAnalysis(userId);
    return res.json({ analysis });
  } catch (error) {
    next(error);
  }
};
