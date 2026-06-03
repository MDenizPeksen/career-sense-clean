const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { requireAuth } = require('../middleware/authMiddleware');

// Interview routes (protected)
router.post('/interview/questions', requireAuth, interviewController.getInterviewQuestions);

module.exports = router;
