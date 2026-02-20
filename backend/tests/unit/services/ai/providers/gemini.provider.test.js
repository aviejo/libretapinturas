// tests/unit/services/ai/providers/gemini.provider.test.js
// Tests for Gemini AI Provider

const GeminiProvider = require('../../../../src/services/ai/providers/gemini.provider');
const AIProvider = require('../../../../src/services/ai/ai.provider');

// Mock Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn()
    })
  }))
}));

describe('GeminiProvider', () => {
  let provider;
  const mockConfig = {
    apiKey: 'test-api-key',
    url: 'http://test-api.com',
    model: 'gemini-test'
  };

  beforeEach(() => {
    // Clear module cache
    jest.clearAllMocks();
    provider = new GeminiProvider(mockConfig);
  });

  it('T4.7: should instantiate with API key', () => {
    expect(provider).toBeDefined();
    expect(provider).toBeInstanceOf(AIProvider);
    expect(provider.config.apiKey).toBe('test-api-key');
  });

  it('T4.8: should build prompt with user palette', () => {
    const userPalette = [
      { brand: 'Vallejo', name: 'German Grey', color: '#5b5f4a', id: 'paint-1' },
      { brand: 'Vallejo', name: 'Black', color: '#000000', id: 'paint-2' }
    ];
    
    const prompt = provider.buildPrompt('Vallejo', 'Test Mix', userPalette);
    
    expect(prompt).toContain('Vallejo Test Mix');
    expect(prompt).toContain('German Grey');
    expect(prompt).toContain('#5b5f4a');
    expect(prompt).toContain('JSON format');
  });

  it('T4.9: should call Gemini API to generate mix', async () => {
    const mockResponse = {
      response: {
        text: () => JSON.stringify({
          targetBrand: 'Vallejo',
          targetName: 'Test Mix',
          confidence: 0.85,
          explanation: 'Test mix explanation',
          components: [
            { paintId: 'paint-1', drops: 6 },
            { paintId: 'paint-2', drops: 3 }
          ]
        })
      }
    };
    
    provider.model.generateContent.mockResolvedValue(mockResponse);
    
    const userPalette = [
      { brand: 'Vallejo', name: 'Paint 1', color: '#FF0000', id: 'paint-1' },
      { brand: 'Vallejo', name: 'Paint 2', color: '#00FF00', id: 'paint-2' }
    ];
    
    const result = await provider.generateMix('Vallejo', 'Test Mix', userPalette);
    
    expect(result).toBeDefined();
    expect(result.targetBrand).toBe('Vallejo');
    expect(result.targetName).toBe('Test Mix');
    expect(result.confidence).toBe(0.85);
    expect(result.components).toHaveLength(2);
  });

  it('T4.10: should handle API errors gracefully', async () => {
    provider.model.generateContent.mockRejectedValue(new Error('API Error'));
    
    const userPalette = [{ brand: 'Vallejo', name: 'Paint 1', color: '#FF0000', id: 'paint-1' }];
    
    await expect(provider.generateMix('Vallejo', 'Test', userPalette))
      .rejects
      .toThrow('AI generation failed');
  });

  it('T4.11: should parse JSON response correctly', () => {
    const jsonResponse = `{"targetBrand": "Vallejo", "targetName": "Mix", "components": [{"paintId": "1", "drops": 5}]}`;
    
    const result = provider.parseResponse(jsonResponse);
    
    expect(result.targetBrand).toBe('Vallejo');
    expect(result.components).toHaveLength(1);
  });

  it('T4.12: should validate AI response before returning', async () => {
    const mockResponse = {
      response: {
        text: () => JSON.stringify({
          targetBrand: 'Vallejo',
          targetName: 'Test Mix',
          confidence: 0.85,
          components: [
            { paintId: 'paint-1', drops: 6 },
            { paintId: 'paint-2', drops: 3 }
          ]
        })
      }
    };
    
    provider.model.generateContent.mockResolvedValue(mockResponse);
    
    const userPalette = [
      { brand: 'Vallejo', name: 'Paint 1', color: '#FF0000', id: 'paint-1' },
      { brand: 'Vallejo', name: 'Paint 2', color: '#00FF00', id: 'paint-2' }
    ];
    
    const result = await provider.generateMix('Vallejo', 'Test Mix', userPalette);
    
    // Should include metadata
    expect(result.aiMetadata).toBeDefined();
    expect(result.aiMetadata.provider).toBe('gemini');
    expect(result.aiMetadata.model).toBe('gemini-test');
    expect(result.aiMetadata.timestamp).toBeDefined();
  });

  it('should reject invalid recipe from AI', async () => {
    const mockResponse = {
      response: {
        text: () => JSON.stringify({
          targetBrand: 'Vallejo',
          targetName: 'Test Mix',
          components: [{ paintId: 'paint-1', drops: 6 }] // Only 1 component
        })
      }
    };
    
    provider.model.generateContent.mockResolvedValue(mockResponse);
    
    const userPalette = [
      { brand: 'Vallejo', name: 'Paint 1', color: '#FF0000', id: 'paint-1' }
    ];
    
    await expect(provider.generateMix('Vallejo', 'Test', userPalette))
      .rejects
      .toThrow('Recipe must have at least 2 components');
  });
});
