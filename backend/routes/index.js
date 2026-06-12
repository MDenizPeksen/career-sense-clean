const express = require('express');
const router = express.Router();

// Import route modules
const cvRoutes = require('./cvRoutes');
const archetypeRoutes = require('./archetypeRoutes');
const healthRoutes = require('./healthRoutes');
const interviewRoutes = require('./interviewRoutes');
const discoveryRoutes = require('./discoveryRoutes');
const careerPathRoutes = require('./careerPathRoutes');
const engagementRoutes = require('./engagementRoutes');

// Basic root route
router.get('/', (req, res) => {
  res.json({ message: 'CareerSense API is running' });
});

// Register routes
router.use('/', cvRoutes);
router.use('/api', archetypeRoutes);
router.use('/api', interviewRoutes);
router.use('/api', discoveryRoutes);
router.use('/api', careerPathRoutes);
router.use('/api', engagementRoutes);
router.use('/', healthRoutes);

module.exports = router;
