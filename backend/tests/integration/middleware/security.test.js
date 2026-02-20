// tests/integration/middleware/security.test.js
// Integration tests for security middlewares

const request = require('supertest');
const express = require('express');

describe('Security Middlewares', () => {
  let app;

  beforeEach(() => {
    app = express();
    
    // Setup basic middlewares
    app.use(express.json());
  });

  describe('Helmet Middleware', () => {
    it('should set security headers', async () => {
      const helmet = require('helmet');
      app.use(helmet());
      
      app.get('/test', (req, res) => res.json({ ok: true }));

      const response = await request(app)
        .get('/test')
        .expect(200);

      // Check for common security headers
      expect(response.headers['x-dns-prefetch-control']).toBeDefined();
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-download-options']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBeDefined();
    });

    it('should disable X-Powered-By header', async () => {
      const helmet = require('helmet');
      app.use(helmet());
      
      app.get('/test', (req, res) => res.json({ ok: true }));

      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('CORS Middleware', () => {
    it('should allow requests from configured origin', async () => {
      const cors = require('cors');
      app.use(cors({
        origin: 'http://localhost:5173',
        credentials: true
      }));
      
      app.get('/test', (req, res) => res.json({ ok: true }));

      const response = await request(app)
        .get('/test')
        .set('Origin', 'http://localhost:5173')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should handle preflight requests', async () => {
      const cors = require('cors');
      app.use(cors({
        origin: 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
      }));
      
      app.get('/test', (req, res) => res.json({ ok: true }));

      const response = await request(app)
        .options('/test')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'POST')
        .expect(204);

      expect(response.headers['access-control-allow-methods']).toContain('POST');
    });
  });

  describe('Rate Limiting Middleware', () => {
    it('should allow requests under the limit', async () => {
      const rateLimit = require('express-rate-limit');
      
      app.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false
      }));
      
      app.get('/test', (req, res) => res.json({ ok: true }));

      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.headers['ratelimit-limit']).toBeDefined();
    });

    it('should block requests over the limit', async () => {
      const rateLimit = require('express-rate-limit');
      
      // Very strict limit for testing
      app.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 2, // Only 2 requests allowed
        standardHeaders: true,
        legacyHeaders: false,
        skip: () => false // Don't skip any requests
      }));
      
      app.get('/test', (req, res) => res.json({ ok: true }));

      // Make 2 requests (should succeed)
      await request(app).get('/test').expect(200);
      await request(app).get('/test').expect(200);
      
      // 3rd request should be rate limited
      const response = await request(app)
        .get('/test')
        .expect(429);

      // Rate limit response may or may not have a body depending on configuration
      expect(response.status).toBe(429);
    });
  });
});
