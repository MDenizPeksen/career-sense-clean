const express = require('express');
const router = express.Router();
const careerPathController = require('../controllers/careerPathController');
const { requireAuth } = require('../middleware/authMiddleware');

// Career-path / skill-gap route (protected — reads the user's saved analysis).
router.get('/career-paths', requireAuth, careerPathController.getCareerPaths);

module.exports = router;
