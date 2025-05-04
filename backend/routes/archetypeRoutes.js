const express = require('express');
const router = express.Router();
const archetypeController = require('../controllers/archetypeController');

// Archetype route
router.post('/archetype', archetypeController.getArchetype);

module.exports = router;
