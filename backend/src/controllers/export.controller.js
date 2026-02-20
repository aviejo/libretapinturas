const paintService = require('../services/paint.service');

class ExportController {
  /**
   * Export user's paint collection
   * GET /api/export
   */
  async exportCollection(req, res, next) {
    try {
      // Get user ID from auth token
      const userId = req.user.userId;
      
      // Get all paints for the user
      const paints = await paintService.getAllByUser(userId);
      
      // Build export object
      const exportData = {
        schema_version: '1.0',
        exported_at: new Date().toISOString(),
        paints: paints
      };
      
      res.json({
        success: true,
        data: exportData
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExportController();
