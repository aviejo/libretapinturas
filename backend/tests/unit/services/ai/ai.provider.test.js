// tests/unit/services/ai/ai.provider.test.js
// Tests for AI Provider base class

const AIProvider = require('../../../../src/services/ai/ai.provider');

describe('AIProvider Base Class', () => {
  it('T4.1: should be an abstract class with generateMix method', () => {
    // AIProvider should exist
    expect(AIProvider).toBeDefined();
    expect(typeof AIProvider).toBe('function');
  });

  it('T4.1: should throw error when calling generateMix on base class', async () => {
    const provider = new AIProvider();
    
    await expect(provider.generateMix('test prompt', []))
      .rejects
      .toThrow('Must implement generateMix');
  });

  it('T4.1: should validate response structure', () => {
    const provider = new AIProvider();
    
    // Valid response structure
    const validResponse = {
      targetBrand: 'Vallejo',
      targetName: 'Test Mix',
      confidence: 0.85,
      explanation: 'Test explanation',
      components: [
        { paintId: 'paint-1', drops: 6 },
        { paintId: 'paint-2', drops: 3 }
      ]
    };
    
    expect(() => provider.validateRecipe(validResponse)).not.toThrow();
    
    // Invalid - missing targetName
    const invalidResponse = {
      targetBrand: 'Vallejo',
      components: []
    };
    
    expect(() => provider.validateRecipe(invalidResponse))
      .toThrow('Missing target brand or name');
  });

  it('T4.1: should require at least 2 components', () => {
    const provider = new AIProvider();
    
    const singleComponent = {
      targetBrand: 'Vallejo',
      targetName: 'Test',
      components: [{ paintId: 'paint-1', drops: 6 }]
    };
    
    expect(() => provider.validateRecipe(singleComponent))
      .toThrow('Recipe must have at least 2 components');
  });

  it('T4.1: should require positive drops', () => {
    const provider = new AIProvider();
    
    const invalidDrops = {
      targetBrand: 'Vallejo',
      targetName: 'Test',
      components: [
        { paintId: 'paint-1', drops: -1 },
        { paintId: 'paint-2', drops: 3 }
      ]
    };
    
    expect(() => provider.validateRecipe(invalidDrops))
      .toThrow('Drops must be positive integers');
  });

  it('T4.1: should require confidence between 0 and 1', () => {
    const provider = new AIProvider();
    
    const invalidConfidence = {
      targetBrand: 'Vallejo',
      targetName: 'Test',
      confidence: 1.5,
      components: [
        { paintId: 'paint-1', drops: 6 },
        { paintId: 'paint-2', drops: 3 }
      ]
    };
    
    expect(() => provider.validateRecipe(invalidConfidence))
      .toThrow('Confidence must be between 0 and 1');
  });
});
