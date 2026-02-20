const paintService = require('./paint.service');
const AIService = require('./ai/ai.service');

class MixService {
  /**
   * Generate a paint mix recipe using AI (preview mode - doesn't save)
   * @param {string} userId - User ID
   * @param {string} targetBrand - Target paint brand
   * @param {string} targetName - Target paint name
   * @param {string} targetColor - Optional target color
   * @param {string} targetReference - Optional target reference
   * @returns {Promise<Object>} Generated recipe preview (not saved)
   */
  async generateMixPreview(userId, targetBrand, targetName, targetColor, targetReference) {
    try {
      // Get user's paint palette
      const userPaints = await paintService.getAllByUser(userId);
      
      if (userPaints.length === 0) {
        return {
          targetBrand,
          targetName,
          targetColor,
          targetReference,
          confidence: 0,
          explanation: 'No tienes pinturas en tu libreta. Añade pinturas para generar mezclas.',
          components: [],
          aiMetadata: {
            provider: 'none',
            model: 'none',
            timestamp: new Date().toISOString(),
            error: 'Empty palette'
          }
        };
      }

      // Prepare palette for AI
      const palette = userPaints.map(paint => ({
        id: paint.id,
        brand: paint.brand,
        name: paint.name,
        color: paint.color,
        reference: paint.reference,
        isMix: paint.isMix
      }));

      // Get AI provider
      const aiProvider = AIService.create();
      
      // Enhance target name with reference if provided
      let enhancedTargetName = targetName;
      if (targetReference) {
        enhancedTargetName = `${targetName} (Ref: ${targetReference})`;
      }
      
      // Generate mix
      const recipe = await aiProvider.generateMix(targetBrand, enhancedTargetName, palette);
      
      // Enrich components with paint details and validate/fix paintIds
      if (recipe.components && recipe.components.length > 0) {
        recipe.components = recipe.components.map(component => {
          // Try to find by exact ID first
          let paint = userPaints.find(p => p.id === component.paintId);
          
          // If not found, try fuzzy matching by name/brand (case insensitive)
          if (!paint && component.paintId) {
            const searchTerm = component.paintId.toLowerCase().trim();
            paint = userPaints.find(p => {
              const paintName = (p.name || '').toLowerCase();
              const paintBrand = (p.brand || '').toLowerCase();
              const fullName = `${paintBrand} ${paintName}`;
              return paintName === searchTerm || 
                     fullName === searchTerm ||
                     paintName.includes(searchTerm) ||
                     searchTerm.includes(paintName);
            });
          }
          
          if (paint) {
            return {
              paintId: paint.id,
              paintName: paint.name,
              brand: paint.brand,
              drops: component.drops,
              color: paint.color,
              percentage: component.percentage || 0
            };
          }
          
          // If still not found, return component with warning
          console.warn(`[MixService] Could not find paint for component: ${JSON.stringify(component)}`);
          return component;
        });
      }

      // Calculate total drops
      const totalDrops = recipe.components?.reduce((sum, c) => sum + (c.drops || 0), 0) || 0;
      
      // Return preview - NOT saved to database
      // Structure expected by frontend: { targetColor, recipe: { components, notes, confidence, totalDrops } }
      return {
        targetBrand,
        targetName,
        targetColor,
        targetReference,
        recipe: {
          components: recipe.components,
          notes: recipe.explanation || '',
          confidence: recipe.confidence || 0,
          totalDrops
        },
        aiMetadata: recipe.aiMetadata
      };
    } catch (error) {
      throw new Error(`Mix generation failed: ${error.message}`);
    }
  }

  /**
   * Generate and save a paint mix recipe using AI (for CLI)
   * @param {string} userId - User ID
   * @param {string} targetBrand - Target paint brand
   * @param {string} targetName - Target paint name
   * @param {string} targetColor - Optional target color
   * @param {string} targetReference - Optional target reference
   * @returns {Promise<Object>} Saved paint with recipe
   */
  async generateMix(userId, targetBrand, targetName, targetColor, targetReference) {
    try {
      // Generate preview first
      const preview = await this.generateMixPreview(userId, targetBrand, targetName, targetColor, targetReference);
      
      // Components are inside preview.recipe.components (new structure)
      const components = preview.recipe?.components || [];
      
      if (components.length === 0) {
        // Return preview if no components (empty palette case)
        return preview;
      }
      
      // Calculate total drops
      const totalDrops = components.reduce((sum, c) => sum + (c.drops || 0), 0);
      
      // Build recipe object - only components and totalDrops
      const recipeObject = {
        components,
        totalDrops
      };
      
      // Save the mix as a paint in the database (for CLI compatibility)
      const mixPaint = await paintService.create(userId, {
        brand: targetBrand,
        name: targetName,
        color: targetColor || null,
        reference: targetReference || '',
        isMix: true,
        recipe: recipeObject,
        notes: preview.recipe?.notes || '',
        inStock: true,
        aiMetadata: preview.aiMetadata
      });

      // Return the saved paint with recipe details
      return {
        ...mixPaint,
        confidence: preview.recipe?.confidence,
        explanation: preview.recipe?.notes
      };
    } catch (error) {
      throw new Error(`Mix generation failed: ${error.message}`);
    }
  }
}

module.exports = new MixService();
