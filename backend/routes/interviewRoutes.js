const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');

// Interview routes
router.post('/interview/questions', interviewController.getInterviewQuestions);

module.exports = router;
