const { prisma } = require('../config/database');

class PaintService {
  async getAllByUser(userId, filters = {}) {
    const where = { userId };

    if (filters.brand) {
      where.brand = filters.brand;
    }

    // Handle type filter (commercial/mix) - convert to isMix boolean
    if (filters.type === 'commercial') {
      where.isMix = false;
    } else if (filters.type === 'mix') {
      where.isMix = true;
    }

    if (filters.isMix !== undefined && !filters.type) {
      where.isMix = filters.isMix;
    }

    if (filters.inStock !== undefined) {
      where.inStock = filters.inStock;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { reference: { contains: filters.search } }
      ];
    }

    const paints = await prisma.paint.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return paints.map(paint => ({
      ...paint,
      recipe: paint.recipeJson ? JSON.parse(paint.recipeJson) : undefined,
      aiMetadata: paint.aiMetadataJson ? JSON.parse(paint.aiMetadataJson) : undefined,
      recipeJson: undefined,
      aiMetadataJson: undefined,
      userId: undefined
    }));
  }

  async getById(id, userId) {
    const paint = await prisma.paint.findFirst({
      where: { id, userId }
    });

    if (!paint) {
      const error = new Error('Pintura no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return {
      ...paint,
      recipe: paint.recipeJson ? JSON.parse(paint.recipeJson) : undefined,
      aiMetadata: paint.aiMetadataJson ? JSON.parse(paint.aiMetadataJson) : undefined,
      recipeJson: undefined,
      aiMetadataJson: undefined,
      userId: undefined
    };
  }

  async create(userId, paintData) {
    const data = {
      userId,
      brand: paintData.brand,
      reference: paintData.reference,
      name: paintData.name,
      isMix: paintData.isMix,
      color: paintData.color,
      notes: paintData.notes,
      inStock: paintData.inStock
    };

    if (paintData.recipe) {
      data.recipeJson = JSON.stringify(paintData.recipe);
    }

    if (paintData.aiMetadata) {
      data.aiMetadataJson = JSON.stringify(paintData.aiMetadata);
    }

    const paint = await prisma.paint.create({ data });

    return {
      ...paint,
      recipe: paint.recipeJson ? JSON.parse(paint.recipeJson) : undefined,
      recipeJson: undefined,
      userId: undefined
    };
  }

  async update(id, userId, paintData) {
    // Check if paint exists and belongs to user
    const existing = await prisma.paint.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      const error = new Error('Pintura no encontrada');
      error.statusCode = 404;
      throw error;
    }

    const data = {};
    
    if (paintData.brand !== undefined) data.brand = paintData.brand;
    if (paintData.reference !== undefined) data.reference = paintData.reference;
    if (paintData.name !== undefined) data.name = paintData.name;
    if (paintData.isMix !== undefined) data.isMix = paintData.isMix;
    if (paintData.color !== undefined) data.color = paintData.color;
    if (paintData.notes !== undefined) data.notes = paintData.notes;
    if (paintData.inStock !== undefined) data.inStock = paintData.inStock;
    
    if (paintData.recipe !== undefined) {
      data.recipeJson = JSON.stringify(paintData.recipe);
    }

    const paint = await prisma.paint.update({
      where: { id },
      data
    });

    return {
      ...paint,
      recipe: paint.recipeJson ? JSON.parse(paint.recipeJson) : undefined,
      aiMetadata: paint.aiMetadataJson ? JSON.parse(paint.aiMetadataJson) : undefined,
      recipeJson: undefined,
      aiMetadataJson: undefined,
      userId: undefined
    };
  }

  async delete(id, userId) {
    // Check if paint exists and belongs to user
    const existing = await prisma.paint.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      const error = new Error('Pintura no encontrada');
      error.statusCode = 404;
      throw error;
    }

    await prisma.paint.delete({
      where: { id }
    });

    return { success: true };
  }
}

module.exports = new PaintService();
