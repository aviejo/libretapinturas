const express = require('express');
const router = express.Router();
const mixController = require('../controllers/mix.controller');
const { authenticateToken } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimit');

// POST /api/mixes/generate - Generate paint mix with AI
// Protected: requires auth
// Rate limited: 10 per hour per user
router.post('/generate', authenticateToken, aiLimiter, mixController.generate);

// GET /api/mixes/preview - Preview the prompt (dry-run, no rate limit)
// Protected: requires auth
router.get('/preview', authenticateToken, mixController.preview);

// GET /api/mixes/health - Test AI connection
// Protected: requires auth
router.get('/health', authenticateToken, mixController.health);

// POST /api/mixes/reset - Reset AI provider cache
// Protected: requires auth
router.post('/reset', authenticateToken, mixController.reset);

// POST /api/mixes/raw - Get raw AI response for debugging
// Protected: requires auth
// Rate limited: 10 per hour per user
router.post('/raw', authenticateToken, aiLimiter, mixController.raw);

module.exports = router;
