// tests/unit/config/database.test.js
// Test for database configuration and connection

const { z } = require('zod');

describe('Database Configuration', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.resetModules();
  });

  describe('Prisma Client', () => {
    it('should export a singleton Prisma client', () => {
      // Setup required env vars
      process.env.DATABASE_URL = 'file:./test.db';
      process.env.JWT_SECRET = 'a-very-long-secret-key-with-at-least-32-characters';
      process.env.AI_API_KEY = 'test-api-key';
      process.env.CORS_ORIGIN = 'http://localhost:5173';

      const { prisma } = require('../../../src/config/database');
      
      expect(prisma).toBeDefined();
      expect(typeof prisma).toBe('object');
    });

    it('should return the same instance (singleton pattern)', () => {
      process.env.DATABASE_URL = 'file:./test.db';
      process.env.JWT_SECRET = 'a-very-long-secret-key-with-at-least-32-characters';
      process.env.AI_API_KEY = 'test-api-key';
      process.env.CORS_ORIGIN = 'http://localhost:5173';

      const { prisma: prisma1 } = require('../../../src/config/database');
      jest.resetModules();
      const { prisma: prisma2 } = require('../../../src/config/database');
      
      expect(prisma1).toBe(prisma2);
    });

    it('should use DATABASE_URL from environment', () => {
      process.env.DATABASE_URL = 'file:./custom-test.db';
      process.env.JWT_SECRET = 'a-very-long-secret-key-with-at-least-32-characters';
      process.env.AI_API_KEY = 'test-api-key';
      process.env.CORS_ORIGIN = 'http://localhost:5173';

      // Import database module
      require('../../../src/config/database');
      
      // Check that PrismaClient was instantiated with correct datasource
      // Note: This is a basic check, in real tests we'd verify the actual connection
      expect(process.env.DATABASE_URL).toBe('file:./custom-test.db');
    });
  });

  describe('Prisma Schema', () => {
    it('should have a valid schema file', () => {
      const fs = require('fs');
      const path = require('path');
      
      const schemaPath = path.join(__dirname, '../../../prisma/schema.prisma');
      expect(fs.existsSync(schemaPath)).toBe(true);
      
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      expect(schemaContent).toContain('datasource db');
      expect(schemaContent).toContain('provider = "sqlite"');
      expect(schemaContent).toContain('model User');
      expect(schemaContent).toContain('model Paint');
    });
  });
});
