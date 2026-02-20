// tests/integration/routes/import.routes.test.js
// Integration tests for import functionality

const request = require('supertest');
const express = require('express');
const { prisma } = require('../../../src/config/database');

describe('Import Routes', () => {
  let app;
  let authToken;
  let userId;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    // Import routes
    const authRoutes = require('../../../src/routes/auth.routes');
    const importRoutes = require('../../../src/routes/import.routes');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/import', importRoutes);
  });

  beforeEach(async () => {
    // Clean up
    await prisma.paint.deleteMany();
    await prisma.user.deleteMany();

    // Create test user
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'import.test@example.com',
        password: 'password123'
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'import.test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.data.token;
    userId = loginResponse.body.data.user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('T5.9: POST /api/import', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/import')
        .send({
          schema_version: '1.0',
          paints: []
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 with missing token', async () => {
      const response = await request(app)
        .post('/api/import')
        .set('Authorization', '')
        .send({ schema_version: '1.0', paints: [] });

      expect(response.status).toBe(401);
    });

    it('should return 403 with invalid token', async () => {
      const response = await request(app)
        .post('/api/import')
        .set('Authorization', 'Bearer invalid-token')
        .send({ schema_version: '1.0', paints: [] });

      expect(response.status).toBe(403);
    });

    it('T5.11: should reject import without schema_version', async () => {
      const response = await request(app)
        .post('/api/import')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paints: []
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details).toBeDefined();
    });

    it('T5.11: should reject import with unsupported schema_version', async () => {
      const response = await request(app)
        .post('/api/import')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          schema_version: '2.0',
          paints: []
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details).toBeDefined();
    });

    it('T5.12: should reject import without paints array', async () => {
      const response = await request(app)
        .post('/api/import')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          schema_version: '1.0'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('T5.12: should reject import with invalid paint structure', async () => {
      const response = await request(app)
        .post('/api/import')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          schema_version: '1.0',
          paints: [
            { brand: 'Vallejo' } // Missing required fields
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('T5.15: should import paints successfully', async () => {
      const importData = {
        schema_version: '1.0',
        exported_at: new Date().toISOString(),
        paints: [
          {
            brand: 'Vallejo',
            name: 'Black',
            reference: '70.950',
            color: '#000000',
            isMix: false,
            inStock: true
          },
          {
            brand: 'Vallejo',
            name: 'White',
            reference: '70.951',
            color: '#FFFFFF',
            isMix: false,
            inStock: true
          }
        ]
      };

      const response = await request(app)
        .post('/api/import')
        .set('Authorization', `Bearer ${authToken}`)
        .send(importData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.imported).toBe(2);
      expect(response.body.data.errors).toHaveLength(0);
    });

    it('T5.17: should handle duplicate paints by name/reference', async () => {
      // First, create a paint
      await prisma.paint.create({
        data: {
          userId,
          brand: 'Vallejo',
          name: 'Black',
          reference: '70.950',
          color: '#000000',
          isMix: false
        }
      });

      // Try to import the same paint
      const importData = {
        schema_version: '1.0',
        paints: [
          {
            brand: 'Vallejo',
            name: 'Black',
            reference: '70.950',
            color: '#111111', // Different color
            isMix: false
          }
        ]
      };

      const response = await request(app)
        .post('/api/import')
        .set('Authorization', `Bearer ${authToken}`)
        .send(importData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.skipped).toBe(1);
    });
  });
});
