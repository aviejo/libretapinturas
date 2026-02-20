// tests/integration/routes/auth.routes.test.js
// Integration tests for authentication endpoints

const request = require('supertest');
const express = require('express');
const { prisma } = require('../../../src/config/database');

describe('Auth Routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    // Import auth routes
    const authRoutes = require('../../../src/routes/auth.routes');
    app.use('/api/auth', authRoutes);
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.paint.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.password).toBeUndefined(); // Should not return password
    });

    it('should hash the password before saving', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Check database directly
      const user = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      expect(user).toBeDefined();
      expect(user.password).not.toBe(userData.password);
      expect(user.password.length).toBeGreaterThan(20); // Hashed passwords are longer
    });

    it('should reject registration without email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should reject registration without password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject password shorter than 6 characters', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '12345'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123'
      };

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('email');
    });

    it('should trim email whitespace', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: '  test@example.com  ',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.email).toBe('test@example.com');
    });

    it('should convert email to lowercase', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'TEST@EXAMPLE.COM',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.email).toBe('test@example.com');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'login.test@example.com',
          password: 'correctpassword123'
        });
    });

    it('should return JWT token with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login.test@example.com',
          password: 'correctpassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(typeof response.body.data.token).toBe('string');
      expect(response.body.data.token.length).toBeGreaterThan(10);
    });

    it('should return user data without password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login.test@example.com',
          password: 'correctpassword123'
        });

      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe('login.test@example.com');
      expect(response.body.data.user.password).toBeUndefined();
      expect(response.body.data.user.id).toBeDefined();
    });

    it('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login.test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject login without email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject login without password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login.test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should normalize email (lowercase and trim)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: '  LOGIN.TEST@EXAMPLE.COM  ',
          password: 'correctpassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      // Register and login to get token
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'me.test@example.com',
          password: 'password123'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'me.test@example.com',
          password: 'password123'
        });

      authToken = loginResponse.body.data.token;
      userId = loginResponse.body.data.user.id;
    });

    it('should return current user data with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.email).toBe('me.test@example.com');
      expect(response.body.data.password).toBeUndefined();
    });

    it('should return 401 without authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Token requerido');
    });

    it('should return 403 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Token expirado o inválido');
    });
  });
});
