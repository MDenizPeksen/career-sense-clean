const express = require('express');
const router = express.Router();

// Import route modules
const cvRoutes = require('./cvRoutes');
const archetypeRoutes = require('./archetypeRoutes');
const healthRoutes = require('./healthRoutes');
const interviewRoutes = require('./interviewRoutes');
const discoveryRoutes = require('./discoveryRoutes');

// Basic root route
router.get('/', (req, res) => {
  res.json({ message: 'CareerSense API is running' });
});

// Register routes
router.use('/', cvRoutes);
router.use('/api', archetypeRoutes);
router.use('/api', interviewRoutes);
router.use('/api', discoveryRoutes);
router.use('/', healthRoutes);

module.exports = router;
