const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/rateLimit');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login - with rate limiting
router.post('/login', authLimiter, authController.login);

// GET /api/auth/me - protected route
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
