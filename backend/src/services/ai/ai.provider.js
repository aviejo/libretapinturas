// src/services/ai/ai.provider.js
// Abstract base class for AI providers

class AIProvider {
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Generate a paint mix recipe
   * @param {string} targetBrand - Target paint brand
   * @param {string} targetName - Target paint name  
   * @param {Array} userPalette - User's available paints
   * @returns {Promise<Object>} Recipe object
   */
  async generateMix(targetBrand, targetName, userPalette) {
    throw new Error('Must implement generateMix');
  }

  /**
   * Build prompt for AI
   * @param {string} targetBrand - Target paint brand
   * @param {string} targetName - Target paint name
   * @param {Array} userPalette - User's available paints
   * @returns {string} Formatted prompt
   */
  buildPrompt(targetBrand, targetName, userPalette) {
    const paletteStr = userPalette.map(p => 
      `- ${p.brand} ${p.name} (${p.color})${p.reference ? ` [Ref: ${p.reference}]` : ''}`
    ).join('\n');

    return `You are a paint mixing expert for model painting and miniatures.

Task: Create a recipe to mix a paint that matches "${targetBrand} ${targetName}".

Available paints in user's palette:
${paletteStr}

Requirements:
1. Use ONLY the paints listed above
2. Provide exact number of drops for each component
3. Recipe must be reproducible
4. Consider color theory and paint properties

Respond in JSON format with this structure:
{
  "targetBrand": "${targetBrand}",
  "targetName": "${targetName}",
  "confidence": 0.0-1.0,
  "explanation": "Brief explanation of the mix",
  "components": [
    {"paintId": "paint-uuid", "drops": number},
    ...
  ]
}

Confidence guidelines:
- 0.9-1.0: Exact match possible with available paints
- 0.7-0.89: Very close approximation
- 0.5-0.69: Good approximation
- <0.5: Rough approximation only`;
  }

  /**
   * Parse and clean AI response
   * @param {string} responseText - Raw AI response
   * @returns {Object} Parsed recipe
   */
  parseResponse(responseText) {
    try {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }

  /**
   * Validate recipe structure
   * @param {Object} recipe - Recipe to validate
   * @returns {boolean} True if valid
   */
  validateRecipe(recipe) {
    // Check required fields
    if (!recipe || typeof recipe !== 'object') {
      throw new Error('Invalid recipe structure');
    }

    if (!recipe.targetBrand || !recipe.targetName) {
      throw new Error('Missing target brand or name');
    }

    if (!Array.isArray(recipe.components) || recipe.components.length < 2) {
      throw new Error('Recipe must have at least 2 components');
    }

    // Validate each component
    for (const component of recipe.components) {
      if (!component.paintId) {
        throw new Error('Component missing paintId');
      }
      if (!Number.isInteger(component.drops) || component.drops <= 0) {
        throw new Error('Drops must be positive integers');
      }
    }

    // Validate confidence if provided
    if (recipe.confidence !== undefined) {
      if (typeof recipe.confidence !== 'number' || 
          recipe.confidence < 0 || 
          recipe.confidence > 1) {
        throw new Error('Confidence must be between 0 and 1');
      }
    }

    return true;
  }

  /**
   * Clean and normalize text
   * @param {string} text - Input text
   * @returns {string} Cleaned text
   */
  cleanText(text) {
    return text.trim().replace(/\s+/g, ' ');
  }

  /**
   * Test connection to AI service
   * @returns {Promise<Object>} Connection status
   */
  async testConnection() {
    throw new Error('Must implement testConnection');
  }
}

module.exports = AIProvider;
