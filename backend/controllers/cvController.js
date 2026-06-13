const openaiService = require('../services/openaiService');
const fileService = require('../services/fileProcessingService');
const cvParsingService = require('../services/cvParsingService');
const { ValidationError } = require('../utils/errors');
const { getRequestUserId } = require('../middleware/authMiddleware');
const { saveAnalysis, getLatestAnalysis } = require('../db/analyses');
const { enrichLearningRoadmap } = require('../services/analysisEnrichment');

// CV analysis controller
exports.analyzeCV = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ValidationError('No file uploaded', 'Please upload a file to analyze');
    }

    const filePath = req.file.path;
    console.log(`Processing file: ${filePath}`);

    try {
      // Stage 1: Extract raw text from the uploaded file (pdf-parse / mammoth)
      const rawText = await fileService.extractTextFromFile(req.file);

      // Stage 2: Parse into structured ParsedCV (cheap gpt-4o-mini extraction call)
      const parsedCv = await cvParsingService.parseCvStructure(rawText);

      // Stage 3: Convert ParsedCV → structured section-labelled text for the analysis prompt
      const structuredText = cvParsingService.parsedCvToText(parsedCv);

      // Stage 4: Full analysis against the structured text (existing prompt, unchanged)
      const analysis = await openaiService.analyzeCV(structuredText);

      // Attach ParsedCV to the payload so Phase 2.2 can use structured data directly
      analysis.parsed_cv = parsedCv;

      // Attach real, clickable course links (deterministic, code-side).
      enrichLearningRoadmap(analysis);

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
    return res.json({ analysis: enrichLearningRoadmap(analysis) });
  } catch (error) {
    next(error);
  }
};
