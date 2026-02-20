const express = require('express');
const router = express.Router();
const exportController = require('../controllers/export.controller');
const { authenticateToken } = require('../middleware/auth');

// GET /api/export - Export user's paint collection
// Protected: requires auth
router.get('/', authenticateToken, exportController.exportCollection);

module.exports = router;
