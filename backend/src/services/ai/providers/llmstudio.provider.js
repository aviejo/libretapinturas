// src/services/ai/providers/llmstudio.provider.js
// LLMStudio local provider for offline AI processing

const AIProvider = require('../ai.provider');
const axios = require('axios');

class LLMStudioProvider extends AIProvider {
  constructor(config) {
    super(config);
    
    if (!config.url) {
      throw new Error('LLMStudio URL is required (e.g., http://192.168.0.81:1234)');
    }
    
    this.baseUrl = config.url.replace(/\/$/, ''); // Remove trailing slash
    this.modelName = config.model || 'deepseek-coder-v2-lite-16b';
    this.apiKey = config.apiKey || 'not-needed'; // LLMStudio usually doesn't require API key
    
    // Compatibility with AIService validation (expects 'model' property)
    this.model = { 
      name: this.modelName,
      generateContent: async (prompt) => {
        // This is a compatibility shim for the controller's raw() method
        // which expects aiProvider.model.generateContent() to exist
        // LLMStudio uses REST API instead, so this shouldn't be called directly
        throw new Error('LLMStudio does not support direct model.generateContent(). Use generateMix() instead.');
      }
    };
  }

  /**
   * Generate paint mix using LLMStudio API
   * @param {string} targetBrand - Target paint brand
   * @param {string} targetName - Target paint name
   * @param {Array} userPalette - User's available paints
   * @returns {Promise<Object>} Recipe object
   */
  async generateMix(targetBrand, targetName, userPalette) {
    try {
      // Build prompt
      const prompt = this.buildPrompt(targetBrand, targetName, userPalette);
      
      // Call LLMStudio API (OpenAI-compatible endpoint)
      const response = await axios.post(
        `${this.baseUrl}/v1/chat/completions`,
        {
          model: this.modelName,
          messages: [
            {
              role: 'system',
              content: 'You are a paint mixing expert for model painting and miniatures. Respond ONLY with valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2048,
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: 120000 // 2 minutes for local model
        }
      );
      
      const content = response.data.choices[0].message.content;
      
      // Parse response
      const recipe = this.parseResponse(content);
      
      // Validate recipe
      this.validateRecipe(recipe);
      
      // Add metadata
      recipe.aiMetadata = {
        provider: 'llmstudio',
        model: this.modelName,
        timestamp: new Date().toISOString(),
        promptLength: prompt.length,
        baseUrl: this.baseUrl
      };
      
      return recipe;
    } catch (error) {
      if (error.response) {
        throw new Error(`LLMStudio API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      throw new Error(`LLMStudio request failed: ${error.message}`);
    }
  }

  /**
   * Build prompt for LLMStudio (similar to Gemini but optimized for local models)
   * @param {string} targetBrand - Target paint brand
   * @param {string} targetName - Target paint name
   * @param {Array} userPalette - User's available paints
   * @returns {string} Formatted prompt
   */
  buildPrompt(targetBrand, targetName, userPalette) {
    const paletteStr = userPalette.map(p => 
      `- ID: "${p.id}" | ${p.brand} ${p.name} (${p.color})${p.reference ? ` [Ref: ${p.reference}]` : ''}`
    ).join('\n');

    return `You are a paint mixing expert for model painting and miniatures.

Task: Create a recipe to mix a paint that matches "${targetBrand} ${targetName}".

CRITICAL INSTRUCTIONS:
1. You MUST use ONLY the paints listed below in the EXACT format provided
2. For each component, you MUST use the paint's ID exactly as shown (including the full UUID string)
3. Example: if you see "ID: abc-123 | Vallejo German Grey (#4A4A4A)", use "abc-123" as the paintId

Available paints in user's palette:
${paletteStr}

REQUIREMENTS:
1. Use ONLY the paints listed above - do NOT invent new ones
2. Provide exact number of drops for each component (1 drop minimum, typically 1-5 drops)
3. Recipe must be reproducible with exact IDs
4. Consider color theory and paint properties
5. Use 2-4 paints maximum for a good mix

RESPONSE FORMAT (JSON only, no markdown):
{
  "targetBrand": "${targetBrand}",
  "targetName": "${targetName}",
  "confidence": 0.0-1.0,
  "explanation": "Brief explanation of why these paints work together",
  "components": [
    {"paintId": "exact-id-from-list-above", "drops": number},
    {"paintId": "another-exact-id", "drops": number}
  ]
}

Confidence guidelines:
- 0.9-1.0: Exact match possible with available paints
- 0.7-0.89: Very close approximation
- 0.5-0.69: Good approximation
- <0.5: Rough approximation only

Important: Return ONLY the JSON, no markdown formatting, no explanations outside the JSON.`;
  }

  /**
   * Parse response from LLMStudio (OpenAI format)
   * @param {string} responseText - Raw AI response
   * @returns {Object} Parsed recipe
   */
  parseResponse(responseText) {
    try {
      // Try direct JSON parse first
      try {
        return JSON.parse(responseText);
      } catch (e) {
        // Continue to extraction
      }
      
      // Extract JSON from markdown code blocks
      const codeBlockMatch = responseText.match(/```json\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        return JSON.parse(codeBlockMatch[1]);
      }
      
      // Extract JSON from curly braces
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('No valid JSON found in response');
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error.message}. Response was: ${responseText.substring(0, 200)}`);
    }
  }

  /**
   * Test connection to LLMStudio
   * @returns {Promise<Object>} Connection status
   */
  async testConnection() {
    try {
      const testPrompt = 'Respond with "OK" if you receive this message.';
      
      const startTime = Date.now();
      const response = await axios.post(
        `${this.baseUrl}/v1/chat/completions`,
        {
          model: this.modelName,
          messages: [
            { role: 'user', content: testPrompt }
          ],
          max_tokens: 5
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: 30000
        }
      );
      
      const responseTime = Date.now() - startTime;
      const content = response.data.choices[0].message.content;
      
      return {
        status: 'connected',
        provider: 'llmstudio',
        model: this.modelName,
        baseUrl: this.baseUrl,
        responseTime: `${responseTime}ms`,
        testResponse: content.trim(),
        apiKeyPreview: this.apiKey !== 'not-needed' ? `${this.apiKey.substring(0, 8)}...` : 'not-required',
        timestamp: new Date().toISOString(),
        connected: true
      };
    } catch (error) {
      console.error('[LLMStudio Health Check] Connection failed:', error.message);
      
      return {
        status: 'error',
        provider: 'llmstudio',
        model: this.modelName,
        baseUrl: this.baseUrl,
        error: error.message,
        apiKeyPreview: this.apiKey !== 'not-needed' ? `${this.apiKey.substring(0, 8)}...` : 'not-required',
        timestamp: new Date().toISOString(),
        connected: false
      };
    }
  }
}

module.exports = LLMStudioProvider;
