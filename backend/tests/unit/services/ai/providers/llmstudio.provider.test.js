// tests/unit/services/ai/providers/llmstudio.provider.test.js
// Unit tests for LLMStudioProvider

const LLMStudioProvider = require('../../../../src/services/ai/providers/llmstudio.provider');
const AIProvider = require('../../../../src/services/ai/ai.provider');
const axios = require('axios');

// Mock axios
jest.mock('axios');

describe('LLMStudioProvider', () => {
  let provider;
  const mockConfig = {
    url: 'http://192.168.0.81:1234',
    model: 'deepseek-coder-v2-lite-16b',
    apiKey: 'test-key'
  };

  beforeEach(() => {
    provider = new LLMStudioProvider(mockConfig);
    axios.post.mockClear();
  });

  describe('Constructor', () => {
    it('should extend AIProvider base class', () => {
      expect(provider).toBeInstanceOf(AIProvider);
    });

    it('should require URL in config', () => {
      expect(() => {
        new LLMStudioProvider({});
      }).toThrow('LLMStudio URL is required');
    });

    it('should store configuration correctly', () => {
      expect(provider.baseUrl).toBe('http://192.168.0.81:1234');
      expect(provider.modelName).toBe('deepseek-coder-v2-lite-16b');
    });

    it('should remove trailing slash from URL', () => {
      const providerWithSlash = new LLMStudioProvider({
        url: 'http://192.168.0.81:1234/',
        model: 'test-model'
      });
      expect(providerWithSlash.baseUrl).toBe('http://192.168.0.81:1234');
    });
  });

  describe('buildPrompt', () => {
    it('should include target brand and name', () => {
      const palette = [
        { brand: 'Vallejo', name: 'Black', color: '#000000', id: '1' }
      ];
      const prompt = provider.buildPrompt('Vallejo', 'German Grey', palette);
      
      expect(prompt).toContain('Vallejo German Grey');
      expect(prompt).toContain('Vallejo Black (#000000)');
    });

    it('should include reference if provided in paint', () => {
      const palette = [
        { brand: 'Vallejo', name: 'Black', color: '#000000', id: '1', reference: '70.950' }
      ];
      const prompt = provider.buildPrompt('Vallejo', 'Test', palette);
      
      expect(prompt).toContain('[Ref: 70.950]');
    });

    it('should require JSON format in response', () => {
      const palette = [];
      const prompt = provider.buildPrompt('Test', 'Color', palette);
      
      expect(prompt).toContain('Respond in JSON format');
      expect(prompt).toContain('"targetBrand"');
      expect(prompt).toContain('"components"');
    });
  });

  describe('parseResponse', () => {
    it('should parse direct JSON', () => {
      const json = '{"targetBrand": "Test", "targetName": "Color"}';
      const result = provider.parseResponse(json);
      
      expect(result.targetBrand).toBe('Test');
    });

    it('should extract JSON from markdown code blocks', () => {
      const markdown = '```json\n{"targetBrand": "Test"}\n```';
      const result = provider.parseResponse(markdown);
      
      expect(result.targetBrand).toBe('Test');
    });

    it('should extract JSON from curly braces', () => {
      const text = 'Here is the recipe: {"targetBrand": "Test", "targetName": "Color"} Hope it helps!';
      const result = provider.parseResponse(text);
      
      expect(result.targetBrand).toBe('Test');
    });

    it('should throw error for invalid JSON', () => {
      expect(() => {
        provider.parseResponse('not valid json');
      }).toThrow('Failed to parse AI response');
    });
  });

  describe('generateMix', () => {
    it('should call LLMStudio API with correct parameters', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                targetBrand: 'Vallejo',
                targetName: 'Grey',
                confidence: 0.85,
                explanation: 'Test',
                components: [{ paintId: '1', drops: 5 }]
              })
            }
          }]
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      const palette = [{ id: '1', brand: 'Vallejo', name: 'Black', color: '#000000' }];
      const result = await provider.generateMix('Vallejo', 'Grey', palette);
      
      expect(axios.post).toHaveBeenCalledWith(
        'http://192.168.0.81:1234/v1/chat/completions',
        expect.objectContaining({
          model: 'deepseek-coder-v2-lite-16b',
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'system' }),
            expect.objectContaining({ role: 'user' })
          ])
        }),
        expect.any(Object)
      );
      
      expect(result.targetBrand).toBe('Vallejo');
      expect(result.aiMetadata.provider).toBe('llmstudio');
    });

    it('should handle API errors', async () => {
      axios.post.mockRejectedValue(new Error('Connection refused'));
      
      const palette = [];
      await expect(provider.generateMix('Test', 'Color', palette))
        .rejects.toThrow('LLMStudio request failed');
    });
  });

  describe('testConnection', () => {
    it('should return connected status on success', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: { content: 'OK' }
          }]
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      const result = await provider.testConnection();
      
      expect(result.connected).toBe(true);
      expect(result.status).toBe('connected');
      expect(result.provider).toBe('llmstudio');
      expect(result.model).toBe('deepseek-coder-v2-lite-16b');
    });

    it('should return error status on failure', async () => {
      axios.post.mockRejectedValue(new Error('Network error'));
      
      const result = await provider.testConnection();
      
      expect(result.connected).toBe(false);
      expect(result.status).toBe('error');
      expect(result.error).toContain('Network error');
    });
  });
});
