const express = require('express');
const router = express.Router();
const cvController = require('../controllers/cvController');
const { upload } = require('../middleware/uploadMiddleware');
const { requireAuth } = require('../middleware/authMiddleware');

// CV analysis route (protected — verifies the user before any OpenAI work)
router.post('/analyze', requireAuth, upload.single('file'), cvController.analyzeCV);

// Most recent persisted analysis for the signed-in user.
router.get('/analyses/latest', requireAuth, cvController.getLatestAnalysis);

module.exports = router;
