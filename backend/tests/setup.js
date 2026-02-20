// Setup file for Jest tests
// This runs before all tests

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only-min-32-characters-long';
process.env.DATABASE_URL = 'file:./test.db';
process.env.AI_API_KEY = 'test-api-key';
process.env.AI_URL = 'http://localhost:8080/api';
process.env.AI_MODEL = 'gemini-test';
process.env.AI_PROVIDER = 'gemini';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.PORT = '3001';
process.env.LOG_LEVEL = 'silent';

// Mock console methods during tests to reduce noise
global.console = {
  ...console,
  // Uncomment to ignore specific console methods during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Global test utilities
global.testUtils = {
  // Helper to create test users
  createTestUser: (overrides = {}) => ({
    email: 'test@example.com',
    password: 'password123',
    ...overrides
  }),
  
  // Helper to create test paints
  createTestPaint: (overrides = {}) => ({
    brand: 'Vallejo',
    name: 'Test Paint',
    color: '#FF0000',
    isMix: false,
    ...overrides
  })
};

// Clean up database before each test file
// This ensures test isolation
beforeAll(async () => {
  // Dynamic import to avoid circular dependencies
  const { prisma } = require('../src/config/database');
  
  try {
    // Clean in correct order (paints first due to foreign key)
    await prisma.paint.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    // Ignore errors if tables don't exist yet
    console.log('Database cleanup completed (some tables may not exist yet)');
  }
});

// Disconnect Prisma after all tests
afterAll(async () => {
  const { prisma } = require('../src/config/database');
  await prisma.$disconnect();
});
