// tests/integration/routes/paints.routes.test.js
// Integration tests for paints CRUD endpoints

const request = require('supertest');
const express = require('express');
const { prisma } = require('../../../src/config/database');

describe('Paints Routes', () => {
  let app;
  let authToken;
  let userId;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    // Import routes
    const authRoutes = require('../../../src/routes/auth.routes');
    const paintRoutes = require('../../../src/routes/paint.routes');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/paints', paintRoutes);
  });

  beforeEach(async () => {
    // Clean up
    await prisma.paint.deleteMany();
    await prisma.user.deleteMany();

    // Create test user and get token
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'paint.test@example.com',
        password: 'password123'
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'paint.test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.data.token;
    userId = loginResponse.body.data.user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/paints', () => {
    it('T3.1: should return empty array when no paints exist', async () => {
      const response = await request(app)
        .get('/api/paints')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('T3.2: should return list of paints for authenticated user', async () => {
      // Create test paints
      await prisma.paint.createMany({
        data: [
          { userId, brand: 'Vallejo', name: 'Paint 1', color: '#FF0000', isMix: false },
          { userId, brand: 'Vallejo', name: 'Paint 2', color: '#00FF00', isMix: false },
          { userId, brand: 'Citadel', name: 'Paint 3', color: '#0000FF', isMix: false }
        ]
      });

      const response = await request(app)
        .get('/api/paints')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('brand');
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).not.toHaveProperty('userId');
    });

    it('T3.3: should filter paints by brand', async () => {
      await prisma.paint.createMany({
        data: [
          { userId, brand: 'Vallejo', name: 'V1', color: '#FF0000' },
          { userId, brand: 'Vallejo', name: 'V2', color: '#00FF00' },
          { userId, brand: 'Citadel', name: 'C1', color: '#0000FF' }
        ]
      });

      const response = await request(app)
        .get('/api/paints?brand=Vallejo')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every(p => p.brand === 'Vallejo')).toBe(true);
    });

    it('T3.4: should filter paints by isMix', async () => {
      await prisma.paint.createMany({
        data: [
          { userId, brand: 'Vallejo', name: 'Commercial', color: '#FF0000', isMix: false },
          { userId, brand: 'Custom', name: 'Mix 1', color: '#00FF00', isMix: true },
          { userId, brand: 'Custom', name: 'Mix 2', color: '#0000FF', isMix: true }
        ]
      });

      const response = await request(app)
        .get('/api/paints?isMix=true')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every(p => p.isMix === true)).toBe(true);
    });

    it('T3.5: should filter paints by inStock', async () => {
      await prisma.paint.createMany({
        data: [
          { userId, brand: 'Vallejo', name: 'In Stock', color: '#FF0000', inStock: true },
          { userId, brand: 'Vallejo', name: 'Out of Stock', color: '#00FF00', inStock: false }
        ]
      });

      const response = await request(app)
        .get('/api/paints?inStock=true')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].inStock).toBe(true);
    });

    it('T3.6: should search paints by name or reference', async () => {
      await prisma.paint.createMany({
        data: [
          { userId, brand: 'Vallejo', reference: '70.830', name: 'German Grey', color: '#5b5f4a' },
          { userId, brand: 'Vallejo', reference: '70.831', name: 'German Field Grey', color: '#6b6f5a' },
          { userId, brand: 'Citadel', reference: 'CIT-001', name: 'Abaddon Black', color: '#000000' }
        ]
      });

      const response = await request(app)
        .get('/api/paints?search=German')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every(p => 
        p.name.includes('German') || p.reference?.includes('German')
      )).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/paints');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('T3.7-T3.12: POST /api/paints', () => {
    it('T3.7: should create a commercial paint with valid data', async () => {
      const paintData = {
        brand: 'Vallejo',
        reference: '70.830',
        name: 'German Grey',
        color: '#5b5f4a',
        isMix: false,
        inStock: true
      };

      const response = await request(app)
        .post('/api/paints')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paintData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.brand).toBe(paintData.brand);
      expect(response.body.data.name).toBe(paintData.name);
      expect(response.body.data.color).toBe(paintData.color);
    });

    it('T3.8: should create a paint mix with recipe', async () => {
      const paintData = {
        brand: 'Custom Mix',
        name: 'My Grey Mix',
        color: '#6b6f5a',
        isMix: true,
        inStock: true,
        recipe: {
          components: [
            { paintId: 'paint-1', drops: 6 },
            { paintId: 'paint-2', drops: 3 }
          ],
          notes: 'Test recipe notes'
        }
      };

      const response = await request(app)
        .post('/api/paints')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paintData);

      expect(response.status).toBe(201);
      expect(response.body.data.isMix).toBe(true);
      expect(response.body.data.recipe).toBeDefined();
      expect(response.body.data.recipe.components).toHaveLength(2);
    });

    it('T3.9: should reject paint without required fields', async () => {
      const response = await request(app)
        .post('/api/paints')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          brand: 'Vallejo'
          // Missing name and color
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('T3.10: should validate color format (hexadecimal)', async () => {
      const response = await request(app)
        .post('/api/paints')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          brand: 'Vallejo',
          name: 'Test Paint',
          color: 'invalid-color'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('T3.11: should associate paint with authenticated user', async () => {
      const paintData = {
        brand: 'Vallejo',
        name: 'User Paint',
        color: '#FF0000'
      };

      const response = await request(app)
        .post('/api/paints')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paintData);

      expect(response.status).toBe(201);
      
      // Verify in database
      const paint = await prisma.paint.findUnique({
        where: { id: response.body.data.id }
      });
      
      expect(paint.userId).toBe(userId);
    });

    it('T3.12: should require authentication for creation', async () => {
      const response = await request(app)
        .post('/api/paints')
        .send({
          brand: 'Vallejo',
          name: 'Test',
          color: '#FF0000'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('T3.13-T3.18: GET /api/paints/:id', () => {
    let testPaintId;

    beforeEach(async () => {
      const paint = await prisma.paint.create({
        data: {
          userId,
          brand: 'Vallejo',
          name: 'Specific Paint',
          color: '#5b5f4a'
        }
      });
      testPaintId = paint.id;
    });

    it('T3.13: should return specific paint by id', async () => {
      const response = await request(app)
        .get(`/api/paints/${testPaintId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testPaintId);
      expect(response.body.data.name).toBe('Specific Paint');
      expect(response.body.data.userId).toBeUndefined();
    });

    it('T3.14: should return 404 for non-existent paint', async () => {
      const response = await request(app)
        .get('/api/paints/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Pintura no encontrada');
    });

    it('T3.15: should reject access to other user paint', async () => {
      // Create another user and their paint
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'other@example.com',
          password: 'password123'
        });

      const otherLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'other@example.com',
          password: 'password123'
        });

      const otherUserId = otherLogin.body.data.user.id;
      
      const otherPaint = await prisma.paint.create({
        data: {
          userId: otherUserId,
          brand: 'Vallejo',
          name: 'Other User Paint',
          color: '#FF0000'
        }
      });

      const response = await request(app)
        .get(`/api/paints/${otherPaint.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('T3.19-T3.26: PUT /api/paints/:id', () => {
    let testPaintId;

    beforeEach(async () => {
      const paint = await prisma.paint.create({
        data: {
          userId,
          brand: 'Vallejo',
          name: 'Paint to Update',
          color: '#5b5f4a',
          inStock: true
        }
      });
      testPaintId = paint.id;
    });

    it('T3.19: should update paint fields', async () => {
      const response = await request(app)
        .put(`/api/paints/${testPaintId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Paint Name',
          inStock: false
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Paint Name');
      expect(response.body.data.inStock).toBe(false);
      expect(response.body.data.brand).toBe('Vallejo'); // Unchanged
    });

    it('T3.20: should return 404 for non-existent paint', async () => {
      const response = await request(app)
        .put('/api/paints/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('T3.21: should reject update to other user paint', async () => {
      // Create another user and their paint
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'other2@example.com',
          password: 'password123'
        });

      const otherLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'other2@example.com',
          password: 'password123'
        });

      const otherPaint = await prisma.paint.create({
        data: {
          userId: otherLogin.body.data.user.id,
          brand: 'Vallejo',
          name: 'Other Paint',
          color: '#FF0000'
        }
      });

      const response = await request(app)
        .put(`/api/paints/${otherPaint.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Hacked Name' });

      expect(response.status).toBe(404);
    });

    it('T3.22: should validate color format on update', async () => {
      const response = await request(app)
        .put(`/api/paints/${testPaintId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ color: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('T3.23-T3.26: DELETE /api/paints/:id', () => {
    let testPaintId;

    beforeEach(async () => {
      const paint = await prisma.paint.create({
        data: {
          userId,
          brand: 'Vallejo',
          name: 'Paint to Delete',
          color: '#5b5f4a'
        }
      });
      testPaintId = paint.id;
    });

    it('T3.23: should delete paint', async () => {
      const response = await request(app)
        .delete(`/api/paints/${testPaintId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify deletion
      const paint = await prisma.paint.findUnique({
        where: { id: testPaintId }
      });
      expect(paint).toBeNull();
    });

    it('T3.24: should return 404 for non-existent paint', async () => {
      const response = await request(app)
        .delete('/api/paints/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('T3.25: should reject deletion of other user paint', async () => {
      // Create another user and their paint
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'other3@example.com',
          password: 'password123'
        });

      const otherLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'other3@example.com',
          password: 'password123'
        });

      const otherPaint = await prisma.paint.create({
        data: {
          userId: otherLogin.body.data.user.id,
          brand: 'Vallejo',
          name: 'Protected Paint',
          color: '#FF0000'
        }
      });

      const response = await request(app)
        .delete(`/api/paints/${otherPaint.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('T3.26: should require authentication for deletion', async () => {
      const response = await request(app)
        .delete(`/api/paints/${testPaintId}`);

      expect(response.status).toBe(401);
    });
  });
});
