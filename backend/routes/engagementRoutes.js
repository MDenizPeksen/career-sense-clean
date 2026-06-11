const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const waitlistController = require('../controllers/waitlistController');

// Public engagement endpoints (no requireAuth — anonymous visitors can submit).
// A signed-in submitter is still attributed via getRequestUserId in the
// controllers. Stricter rate limiting is applied per-path in app.js.
router.post('/feedback', feedbackController.submitFeedback);
router.post('/contact', feedbackController.submitContact);
router.post('/waitlist', waitlistController.join);

module.exports = router;
