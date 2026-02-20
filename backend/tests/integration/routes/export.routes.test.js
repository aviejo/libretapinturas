// tests/integration/routes/export.routes.test.js
// Integration tests for export functionality

const request = require('supertest');
const express = require('express');
const { prisma } = require('../../../src/config/database');

describe('Export Routes', () => {
  let app;
  let authToken;
  let userId;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    // Import routes
    const authRoutes = require('../../../src/routes/auth.routes');
    const exportRoutes = require('../../../src/routes/export.routes');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/export', exportRoutes);
  });

  beforeEach(async () => {
    // Clean up
    await prisma.paint.deleteMany();
    await prisma.user.deleteMany();

    // Create test user
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'export.test@example.com',
        password: 'password123'
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'export.test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.data.token;
    userId = loginResponse.body.data.user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('T5.1-T5.4: GET /api/export', () => {
    it('T5.1: should require authentication', async () => {
      const response = await request(app)
        .get('/api/export');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 with missing token', async () => {
      const response = await request(app)
        .get('/api/export')
        .set('Authorization', '');

      expect(response.status).toBe(401);
    });

    it('should return 403 with invalid token', async () => {
      const response = await request(app)
        .get('/api/export')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('T5.3: should return JSON with schema_version', async () => {
      const response = await request(app)
        .get('/api/export')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.schema_version).toBe('1.0');
      expect(response.body.data.exported_at).toBeDefined();
      expect(new Date(response.body.data.exported_at)).toBeInstanceOf(Date);
    });

    it('T5.4: should return empty paints array when no paints exist', async () => {
      const response = await request(app)
        .get('/api/export')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.paints).toBeDefined();
      expect(Array.isArray(response.body.data.paints)).toBe(true);
      expect(response.body.data.paints).toHaveLength(0);
    });

    it('T5.5: should include all user paints in export', async () => {
      // Create test paints
      await prisma.paint.createMany({
        data: [
          { userId, brand: 'Vallejo', name: 'Black', color: '#000000', isMix: false },
          { userId, brand: 'Vallejo', name: 'White', color: '#FFFFFF', isMix: false },
          { userId, brand: 'Custom', name: 'Grey Mix', color: '#808080', isMix: true }
        ]
      });

      const response = await request(app)
        .get('/api/export')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.paints).toHaveLength(3);
      
      // Verify paint structure
      const blackPaint = response.body.data.paints.find(p => p.name === 'Black');
      expect(blackPaint).toBeDefined();
      expect(blackPaint.brand).toBe('Vallejo');
      expect(blackPaint.color).toBe('#000000');
      expect(blackPaint.isMix).toBe(false);
      
      // Verify mix paint
      const mixPaint = response.body.data.paints.find(p => p.name === 'Grey Mix');
      expect(mixPaint).toBeDefined();
      expect(mixPaint.isMix).toBe(true);
    });

    it('T5.6: should not include paints from other users', async () => {
      // Create paints for current user
      await prisma.paint.create({
        data: { userId, brand: 'Vallejo', name: 'My Paint', color: '#FF0000', isMix: false }
      });

      // Create another user with paints
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'other@example.com', password: 'password123' });
      
      const otherLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'other@example.com', password: 'password123' });
      
      const otherUserId = otherLogin.body.data.user.id;
      
      await prisma.paint.create({
        data: { userId: otherUserId, brand: 'Citadel', name: 'Other Paint', color: '#00FF00', isMix: false }
      });

      const response = await request(app)
        .get('/api/export')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.paints).toHaveLength(1);
      expect(response.body.data.paints[0].name).toBe('My Paint');
    });

    it('T5.7: should handle paint mixes with recipes correctly', async () => {
      // Create a mix paint with recipe
      await prisma.paint.create({
        data: {
          userId,
          brand: 'Custom',
          name: 'Dark Grey Mix',
          color: '#404040',
          isMix: true,
          recipeJson: JSON.stringify([
            { paintId: 'paint-1', brand: 'Vallejo', name: 'Black', drops: 3 },
            { paintId: 'paint-2', brand: 'Vallejo', name: 'White', drops: 1 }
          ]),
          notes: 'Mix for dark grey armor',
          inStock: true
        }
      });

      const response = await request(app)
        .get('/api/export')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.paints).toHaveLength(1);
      
      const mixPaint = response.body.data.paints[0];
      expect(mixPaint.isMix).toBe(true);
      expect(mixPaint.recipe).toBeDefined();
      expect(Array.isArray(mixPaint.recipe)).toBe(true);
      expect(mixPaint.recipe).toHaveLength(2);
      expect(mixPaint.recipe[0].name).toBe('Black');
      expect(mixPaint.recipe[0].drops).toBe(3);
    });
  });
});
