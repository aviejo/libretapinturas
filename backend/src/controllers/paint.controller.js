const paintService = require('../services/paint.service');
const { paintSchema, updatePaintSchema, paintFiltersSchema } = require('../schemas/paint.schema');
const logger = require('../config/logger');

class PaintController {
  async getAll(req, res, next) {
    try {
      const userId = req.user.userId;
      const filters = paintFiltersSchema.parse(req.query);
      
      const paints = await paintService.getAllByUser(userId, filters);
      
      res.json({
        success: true,
        data: paints
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Filtros inválidos',
          details: error.errors
        });
      }
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      const paint = await paintService.getById(id, userId);
      
      res.json({
        success: true,
        data: paint
      });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const userId = req.user.userId;
      logger.info({ userId, paintName: req.body.name }, 'Creating new paint');
      
      const paintData = paintSchema.parse(req.body);
      
      const paint = await paintService.create(userId, paintData);
      
      logger.info({ userId, paintId: paint.id, paintName: paint.name }, 'Paint created successfully');
      
      res.status(201).json({
        success: true,
        data: paint
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        logger.warn({ userId: req.user.userId, errors: error.errors }, 'Paint creation failed: validation error');
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          details: error.errors
        });
      }
      logger.error({ error: error.message, userId: req.user.userId }, 'Paint creation failed: unexpected error');
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const paintData = updatePaintSchema.parse(req.body);
      
      const paint = await paintService.update(id, userId, paintData);
      
      res.json({
        success: true,
        data: paint
      });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          details: error.errors
        });
      }
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      logger.info({ userId, paintId: id }, 'Deleting paint');
      
      await paintService.delete(id, userId);
      
      logger.info({ userId, paintId: id }, 'Paint deleted successfully');
      
      res.json({
        success: true,
        message: 'Pintura eliminada correctamente'
      });
    } catch (error) {
      if (error.statusCode === 404) {
        logger.warn({ userId: req.user.userId, paintId: req.params.id }, 'Paint deletion failed: not found');
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      logger.error({ error: error.message, userId: req.user.userId, paintId: req.params.id }, 'Paint deletion failed: unexpected error');
      next(error);
    }
  }
}

module.exports = new PaintController();
