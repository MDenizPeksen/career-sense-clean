const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

// Health check routes
router.get('/health', healthController.getHealth);
router.get('/ping', healthController.ping);
router.get('/test-openai', healthController.testOpenAI);

module.exports = router;
