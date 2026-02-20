// tests/unit/services/ai/ai.service.test.js
// Tests for AI Service Factory

const AIService = require('../../../../src/services/ai/ai.service');
const GeminiProvider = require('../../../../src/services/ai/providers/gemini.provider');
const AIProvider = require('../../../../src/services/ai/ai.provider');

describe('AIService Factory', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    AIService.reset();
    // Reset modules to clear cache
    jest.resetModules();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('T4.3: should create Gemini provider by default', () => {
    process.env.AI_PROVIDER = 'gemini';
    process.env.AI_API_KEY = 'test-key';
    process.env.AI_URL = 'http://test.com';
    process.env.AI_MODEL = 'gemini-test';
    
    const provider = AIService.create();
    
    expect(provider).toBeInstanceOf(GeminiProvider);
    expect(provider).toBeInstanceOf(AIProvider);
  });

  it('T4.3: should create provider based on AI_PROVIDER env var', () => {
    process.env.AI_PROVIDER = 'gemini';
    process.env.AI_API_KEY = 'test-key';
    
    const provider = AIService.create();
    
    expect(provider).toBeInstanceOf(GeminiProvider);
  });

  it('T4.4: should throw error for unknown provider', () => {
    process.env.AI_PROVIDER = 'unknown-provider';
    
    expect(() => AIService.create())
      .toThrow('Unknown AI provider: unknown-provider');
  });

  it('T4.4: should throw error if AI_API_KEY is missing', () => {
    process.env.AI_PROVIDER = 'gemini';
    delete process.env.AI_API_KEY;
    
    expect(() => AIService.create())
      .toThrow('AI_API_KEY is required');
  });

  it('T4.5: should pass configuration to provider', () => {
    process.env.AI_PROVIDER = 'gemini';
    process.env.AI_API_KEY = 'test-api-key';
    process.env.AI_URL = 'http://custom-api.com';
    process.env.AI_MODEL = 'custom-model';
    
    const provider = AIService.create();
    
    expect(provider.config.apiKey).toBe('test-api-key');
    expect(provider.config.url).toBe('http://custom-api.com');
    expect(provider.config.model).toBe('custom-model');
  });

  it('T4.6: should be a singleton - same instance returned', () => {
    process.env.AI_PROVIDER = 'gemini';
    process.env.AI_API_KEY = 'test-key';
    
    const provider1 = AIService.create();
    const provider2 = AIService.create();
    
    expect(provider1).toBe(provider2);
  });
});
