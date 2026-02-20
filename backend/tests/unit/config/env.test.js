// tests/unit/config/env.test.js
// Test for environment configuration validation

const { z } = require('zod');

describe('Environment Configuration', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = process.env;
    // Create a copy for testing
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    // Clear module cache to reimport fresh
    jest.resetModules();
  });

  describe('validateEnv', () => {
    it('should load and validate all required environment variables', () => {
      // Set all required variables
      process.env.NODE_ENV = 'development';
      process.env.PORT = '3000';
      process.env.DATABASE_URL = 'file:./dev.db';
      process.env.JWT_SECRET = 'a-very-long-secret-key-with-at-least-32-characters';
      process.env.AI_API_KEY = 'test-api-key';
      process.env.AI_PROVIDER = 'gemini';
      process.env.CORS_ORIGIN = 'http://localhost:5173';
      process.env.LOG_LEVEL = 'debug';

      // Import after setting env vars
      const { validateEnv } = require('../../../src/config/env');
      const env = validateEnv();

      expect(env).toBeDefined();
      expect(env.NODE_ENV).toBe('development');
      expect(env.PORT).toBe(3000);
      expect(env.DATABASE_URL).toBe('file:./dev.db');
      expect(env.JWT_SECRET.length).toBeGreaterThanOrEqual(32);
      expect(env.AI_API_KEY).toBe('test-api-key');
      expect(env.AI_PROVIDER).toBe('gemini');
      expect(env.CORS_ORIGIN).toBe('http://localhost:5173');
      expect(env.LOG_LEVEL).toBe('debug');
    });

    it('should use default values for optional variables', () => {
      // Set only required variables, leave optional as undefined
      const testEnv = {
        DATABASE_URL: 'file:./dev.db',
        JWT_SECRET: 'a-very-long-secret-key-with-at-least-32-characters',
        AI_API_KEY: 'test-api-key',
        CORS_ORIGIN: 'http://localhost:5173'
        // NODE_ENV, PORT, AI_PROVIDER, LOG_LEVEL not set - should use defaults
      };
      
      // Replace process.env completely
      process.env = testEnv;

      const { validateEnv } = require('../../../src/config/env');
      const env = validateEnv();

      expect(env.NODE_ENV).toBe('development');
      expect(parseInt(env.PORT)).toBe(3000);
      expect(env.AI_PROVIDER).toBe('gemini');
      expect(env.LOG_LEVEL).toBe('info');
    });

    it('should throw error if DATABASE_URL is missing', () => {
      delete process.env.DATABASE_URL;
      process.env.JWT_SECRET = 'a-very-long-secret-key-with-at-least-32-characters';
      process.env.AI_API_KEY = 'test-api-key';
      process.env.CORS_ORIGIN = 'http://localhost:5173';

      const { validateEnv } = require('../../../src/config/env');
      
      expect(() => validateEnv()).toThrow();
    });

    it('should throw error if JWT_SECRET is too short', () => {
      process.env.DATABASE_URL = 'file:./dev.db';
      process.env.JWT_SECRET = 'short';
      process.env.AI_API_KEY = 'test-api-key';
      process.env.CORS_ORIGIN = 'http://localhost:5173';

      const { validateEnv } = require('../../../src/config/env');
      
      expect(() => validateEnv()).toThrow('JWT_SECRET debe tener al menos 32 caracteres');
    });

    it('should throw error if CORS_ORIGIN is not a valid URL', () => {
      process.env.DATABASE_URL = 'file:./dev.db';
      process.env.JWT_SECRET = 'a-very-long-secret-key-with-at-least-32-characters';
      process.env.AI_API_KEY = 'test-api-key';
      process.env.CORS_ORIGIN = 'not-a-valid-url';

      const { validateEnv } = require('../../../src/config/env');
      
      expect(() => validateEnv()).toThrow();
    });

    it('should throw error if AI_PROVIDER is invalid', () => {
      process.env.DATABASE_URL = 'file:./dev.db';
      process.env.JWT_SECRET = 'a-very-long-secret-key-with-at-least-32-characters';
      process.env.AI_API_KEY = 'test-api-key';
      process.env.CORS_ORIGIN = 'http://localhost:5173';
      process.env.AI_PROVIDER = 'invalid-provider';

      const { validateEnv } = require('../../../src/config/env');
      
      expect(() => validateEnv()).toThrow();
    });

    it('should accept only valid NODE_ENV values', () => {
      const baseEnv = {
        DATABASE_URL: 'file:./dev.db',
        JWT_SECRET: 'a-very-long-secret-key-with-at-least-32-characters',
        AI_API_KEY: 'test-api-key',
        CORS_ORIGIN: 'http://localhost:5173'
      };

      // Test development
      process.env = { ...baseEnv, NODE_ENV: 'development' };
      jest.resetModules();
      let { validateEnv } = require('../../../src/config/env');
      expect(() => validateEnv()).not.toThrow();

      // Test production
      process.env = { ...baseEnv, NODE_ENV: 'production' };
      jest.resetModules();
      ({ validateEnv } = require('../../../src/config/env'));
      expect(() => validateEnv()).not.toThrow();

      // Test test
      process.env = { ...baseEnv, NODE_ENV: 'test' };
      jest.resetModules();
      ({ validateEnv } = require('../../../src/config/env'));
      expect(() => validateEnv()).not.toThrow();

      // Test invalid value
      process.env = { ...baseEnv, NODE_ENV: 'invalid' };
      jest.resetModules();
      ({ validateEnv } = require('../../../src/config/env'));
      expect(() => validateEnv()).toThrow();
    });
  });
});
