const express = require('express');
const router = express.Router();
const discoveryController = require('../controllers/discoveryController');
const { requireAuth } = require('../middleware/authMiddleware');

// Conversational Discovery routes (protected — the agent makes OpenAI calls and
// every session is scoped to the authenticated user).
router.post('/discovery/sessions', requireAuth, discoveryController.startSession);
router.get('/discovery/sessions/latest', requireAuth, discoveryController.getLatestSession);
router.get('/discovery/sessions/:id', requireAuth, discoveryController.getSessionById);
router.post('/discovery/sessions/:id/messages', requireAuth, discoveryController.sendMessage);

module.exports = router;
