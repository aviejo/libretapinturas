const express = require('express');
const router = express.Router();
const paintController = require('../controllers/paint.controller');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// GET /api/paints - List all paints
router.get('/', paintController.getAll);

// GET /api/paints/:id - Get single paint
router.get('/:id', paintController.getById);

// POST /api/paints - Create paint
router.post('/', paintController.create);

// PUT /api/paints/:id - Update paint
router.put('/:id', paintController.update);

// DELETE /api/paints/:id - Delete paint
router.delete('/:id', paintController.delete);

module.exports = router;
