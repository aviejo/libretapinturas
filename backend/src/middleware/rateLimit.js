const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: 'Demasiadas peticiones. Intenta más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    error: 'Demasiados intentos de login. Intenta en 15 minutos.',
  },
  skipSuccessfulRequests: true, // Don't count successful logins
  standardHeaders: true,
  legacyHeaders: false,
});

// AI generation rate limiter (expensive operation)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 generations per hour
  message: {
    success: false,
    error: 'Límite de generaciones alcanzado. Máximo 10 por hora.',
  },
  keyGenerator: (req) => {
    // Use user ID if available, otherwise use a default
    return req.user?.id || 'anonymous';
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter, aiLimiter };
