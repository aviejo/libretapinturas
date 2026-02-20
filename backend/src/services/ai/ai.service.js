// src/services/ai/ai.service.js
// Factory for creating AI providers

const GeminiProvider = require('./providers/gemini.provider');
const LLMStudioProvider = require('./providers/llmstudio.provider');

// Singleton instance cache
let providerInstance = null;

class AIService {
  /**
   * Create or return cached AI provider instance
   * @param {string} providerName - Provider name (optional, defaults to env)
   * @returns {AIProvider} Provider instance
   */
  static create(providerName) {
    // Return cached instance if available and valid
    if (providerInstance && providerInstance.model) {
      return providerInstance;
    }
    
    // Reset if cached instance is invalid (missing model)
    if (providerInstance && !providerInstance.model) {
      console.log('[AIService] Resetting invalid cached provider instance');
      providerInstance = null;
    }

    const name = providerName || process.env.AI_PROVIDER || 'gemini';
    const apiKey = process.env.AI_API_KEY;
    
    // API key is optional for LLMStudio (local provider)
    if (!apiKey && name !== 'llmstudio') {
      throw new Error('AI_API_KEY is required for cloud providers');
    }

    const config = {
      apiKey: apiKey,
      url: process.env.AI_URL,
      model: process.env.AI_MODEL,
      provider: name
    };

    try {
      switch (name) {
        case 'gemini':
          providerInstance = new GeminiProvider(config);
          break;
        case 'llmstudio':
          providerInstance = new LLMStudioProvider(config);
          break;
        case 'openai':
          // Future: implement OpenAI provider
          throw new Error('OpenAI provider not yet implemented');
        default:
          throw new Error(`Unknown AI provider: ${name}`);
      }
      
      // Validate that provider was properly initialized
      // Note: Different providers have different internal structures
      // Gemini has 'model', LLMStudio has 'baseUrl' and 'modelName'
      const isValidProvider = providerInstance.model || providerInstance.baseUrl;
      if (!isValidProvider) {
        throw new Error(`Failed to initialize ${name} provider`);
      }
      
      return providerInstance;
    } catch (error) {
      // Don't cache failed instances
      providerInstance = null;
      throw error;
    }
  }

  /**
   * Reset provider instance (useful for testing)
   */
  static reset() {
    providerInstance = null;
  }
}

module.exports = AIService;
