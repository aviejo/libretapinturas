const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');
const { registerSchema, loginSchema } = require('../schemas/auth.schema');
const { JWT_SECRET } = require('../config/env').validateEnv();
const logger = require('../config/logger');

const JWT_EXPIRES_IN = '24h';

class AuthController {
  async register(req, res, next) {
    try {
      // Normalize input before validation
      const normalizedBody = {
        ...req.body,
        email: req.body.email?.toLowerCase().trim()
      };
      
      logger.info({ email: normalizedBody.email }, 'User registration attempt');
      
      // Validate input
      const { email, password } = registerSchema.parse(normalizedBody);

      // Create user
      const user = await authService.register(email, password);
      
      logger.info({ userId: user.id, email: user.email }, 'User registered successfully');

      res.status(201).json({
        success: true,
        data: user
      });
    } catch (error) {
      if (error.statusCode === 409) {
        logger.warn({ email: req.body.email }, 'Registration failed: email already exists');
        return res.status(409).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.name === 'ZodError') {
        logger.warn({ email: req.body.email, errors: error.errors }, 'Registration failed: validation error');
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          details: error.errors
        });
      }
      
      logger.error({ error: error.message, email: req.body.email }, 'Registration failed: unexpected error');
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      // Normalize input before validation
      const normalizedBody = {
        ...req.body,
        email: req.body.email?.toLowerCase().trim()
      };
      
      logger.info({ email: normalizedBody.email }, 'User login attempt');
      
      // Validate input
      const { email, password } = loginSchema.parse(normalizedBody);

      // Validate credentials
      const user = await authService.validateCredentials(email, password);

      if (!user) {
        logger.warn({ email }, 'Login failed: invalid credentials');
        return res.status(401).json({
          success: false,
          error: 'Credenciales inválidas'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      logger.info({ userId: user.id, email: user.email }, 'User logged in successfully');
      
      res.json({
        success: true,
        data: {
          user,
          token
        }
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        logger.warn({ email: req.body.email, errors: error.errors }, 'Login failed: validation error');
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          details: error.errors
        });
      }
      
      logger.error({ error: error.message, email: req.body.email }, 'Login failed: unexpected error');
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      // req.user is set by authenticateToken middleware
      const user = req.user;

      res.json({
        success: true,
        data: {
          id: user.userId,
          email: user.email
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
