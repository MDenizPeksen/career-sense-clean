const express = require('express');
const router = express.Router();
const archetypeController = require('../controllers/archetypeController');
const { requireAuth } = require('../middleware/authMiddleware');

// Archetype route (protected)
router.post('/archetype', requireAuth, archetypeController.getArchetype);

module.exports = router;
