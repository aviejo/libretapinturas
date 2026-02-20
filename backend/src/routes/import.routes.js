const express = require('express');
const router = express.Router();
const importController = require('../controllers/import.controller');
const { authenticateToken } = require('../middleware/auth');

// POST /api/import - Import paint collection from JSON
// Protected: requires auth
router.post('/', authenticateToken, importController.importCollection);

module.exports = router;
