const express = require('express');
const router = express.Router();
const cvController = require('../controllers/cvController');
const { upload } = require('../middleware/uploadMiddleware');

// CV analysis route
router.post('/analyze', upload.single('file'), cvController.analyzeCV);

module.exports = router;
