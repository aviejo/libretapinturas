const { importCollectionSchema } = require('../schemas/import.schema');
const paintService = require('../services/paint.service');
const { prisma } = require('../config/database');

class ImportController {
  /**
   * Import paint collection from JSON
   * POST /api/import
   */
  async importCollection(req, res, next) {
    try {
      // Get user ID from auth token
      const userId = req.user.userId;
      
      // Validate import data structure
      let importData;
      try {
        importData = importCollectionSchema.parse(req.body);
      } catch (validationError) {
        return res.status(400).json({
          success: false,
          error: 'Datos de importación inválidos',
          details: validationError.errors || validationError.issues
        });
      }
      
      // Transactional import
      const result = await prisma.$transaction(async (tx) => {
        let imported = 0;
        let skipped = 0;
        let errors = [];
        
        for (const paint of importData.paints) {
          try {
            // Check for duplicates by name and reference
            const existingByName = await tx.paint.findFirst({
              where: { userId, name: paint.name }
            });
            
            const existingByRef = paint.reference ? await tx.paint.findFirst({
              where: { userId, reference: paint.reference }
            }) : null;
            
            if (existingByName || existingByRef) {
              skipped++;
              continue;
            }
            
            // Create the paint
            const data = {
              userId,
              brand: paint.brand,
              name: paint.name,
              reference: paint.reference || '',
              color: paint.color,
              isMix: paint.isMix || false,
              notes: paint.notes || '',
              inStock: paint.inStock !== false // Default to true
            };
            
            // Handle recipe if present
            if (paint.recipe && paint.recipe.length > 0) {
              data.recipeJson = JSON.stringify(paint.recipe);
            }
            
            await tx.paint.create({ data });
            imported++;
          } catch (paintError) {
            errors.push({
              paint: paint.name,
              error: paintError.message
            });
          }
        }
        
        return { imported, skipped, errors };
      });
      
      res.status(201).json({
        success: true,
        data: {
          imported: result.imported,
          skipped: result.skipped,
          errors: result.errors,
          message: `Importación completada: ${result.imported} importadas, ${result.skipped} omitidas`
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ImportController();
