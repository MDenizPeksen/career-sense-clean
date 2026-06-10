const openaiService = require('../services/openaiService');
const fileService = require('../services/fileProcessingService');
const fs = require('fs');
const { ValidationError } = require('../utils/errors');

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
