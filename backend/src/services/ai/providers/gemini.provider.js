// src/services/ai/providers/gemini.provider.js
// Gemini AI Provider implementation

const { GoogleGenerativeAI } = require('@google/generative-ai');
const AIProvider = require('../ai.provider');

class GeminiProvider extends AIProvider {
  constructor(config) {
    super(config);
    
    if (!config.apiKey) {
      throw new Error('Gemini API key is required');
    }
    
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.modelName = config.model || 'gemini-1.5-flash';
    this.model = this.genAI.getGenerativeModel({ model: this.modelName });
  }

  /**
   * Generate paint mix using Gemini API
   * @param {string} targetBrand - Target paint brand
   * @param {string} targetName - Target paint name
   * @param {Array} userPalette - User's available paints
   * @returns {Promise<Object>} Recipe object
   */
  async generateMix(targetBrand, targetName, userPalette) {
    try {
      // Build prompt
      const prompt = this.buildPrompt(targetBrand, targetName, userPalette);
      
      // Call Gemini API
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse response
      const recipe = this.parseResponse(text);
      
      // Validate recipe
      this.validateRecipe(recipe);
      
      // Add metadata
      recipe.aiMetadata = {
        provider: 'gemini',
        model: this.modelName,
        timestamp: new Date().toISOString(),
        promptLength: prompt.length
      };
      
      return recipe;
    } catch (error) {
      if (error.message.includes('Must implement')) {
        throw error;
      }
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  /**
   * Build detailed prompt for Gemini
   * @param {string} targetBrand - Target brand
   * @param {string} targetName - Target name
   * @param {Array} userPalette - User's palette
   * @returns {string} Formatted prompt
   */
  buildPrompt(targetBrand, targetName, userPalette) {
    const paletteStr = userPalette.map(p => {
      const ref = p.reference ? ` [Ref: ${p.reference}]` : '';
      return `- ${p.brand} ${p.name} (${p.color}) [ID: ${p.id}]${ref}`;
    }).join('\n');

    return `You are an expert in model paint mixing. Create a recipe to match "${targetBrand} ${targetName}".

AVAILABLE PAINTS (use ONLY these):
${paletteStr}

REQUIREMENTS:
1. Use 2-5 paints from the available list
2. Specify exact drop counts for each
3. Total drops should be reasonable (10-30 total)
4. Consider color theory
5. Prefer paints with similar properties when possible

RESPONSE FORMAT (JSON only):
{
  "targetBrand": "${targetBrand}",
  "targetName": "${targetName}",
  "confidence": 0.0-1.0,
  "explanation": "Brief mixing rationale",
  "components": [
    {"paintId": "uuid-from-list", "drops": number},
    ...
  ]
}

Confidence guide:
- 0.90-1.00: Exact match possible
- 0.75-0.89: Very close approximation  
- 0.60-0.74: Good match
- 0.40-0.59: Approximate only
- <0.40: Poor match with available paints`;
  }

  /**
   * Parse and extract JSON from Gemini response
   * @param {string} text - Raw response
   * @returns {Object} Parsed recipe
   */
  parseResponse(text) {
    try {
      // Try direct JSON parse first
      try {
        return JSON.parse(text);
      } catch (e) {
        // Continue to extraction
      }
      
      // Extract JSON from markdown code blocks
      const codeBlockMatch = text.match(/```json\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        return JSON.parse(codeBlockMatch[1]);
      }
      
      // Extract JSON from curly braces
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('No valid JSON found in response');
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }

  /**
   * Test connection to Gemini API
   * @returns {Promise<Object>} Connection status
   */
  async testConnection() {
    try {
      // Simple test prompt
      const testPrompt = 'Respond with "OK" if you receive this message.';
      
      const startTime = Date.now();
      const result = await this.model.generateContent(testPrompt);
      const responseTime = Date.now() - startTime;
      
      const response = await result.response;
      const text = response.text();
      
      return {
        status: 'connected',
        provider: 'gemini',
        model: this.modelName,
        responseTime: `${responseTime}ms`,
        testResponse: text.trim(),
        apiKeyPreview: this.config.apiKey ? `${this.config.apiKey.substring(0, 8)}...` : 'not-set',
        timestamp: new Date().toISOString(),
        connected: true
      };
    } catch (error) {
      // Log the full error for debugging
      console.error('[AI Health Check] Connection failed:', error.message);
      
      return {
        status: 'error',
        provider: 'gemini',
        model: this.modelName,
        error: error.message,
        apiKeyPreview: this.config.apiKey ? `${this.config.apiKey.substring(0, 8)}...` : 'not-set',
        timestamp: new Date().toISOString(),
        connected: false
      };
    }
  }
}

module.exports = GeminiProvider;
