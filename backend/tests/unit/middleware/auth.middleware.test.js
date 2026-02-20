// tests/unit/middleware/auth.middleware.test.js
// Tests for authentication middleware

const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../../../src/middleware/auth');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  it('should call next() with valid token', () => {
    const token = jwt.sign(
      { userId: 'user-123', email: 'test@example.com' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    req.headers.authorization = `Bearer ${token}`;

    authenticateToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe('user-123');
    expect(req.user.email).toBe('test@example.com');
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 401 if no authorization header', () => {
    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Token requerido'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token format is invalid', () => {
    req.headers.authorization = 'InvalidFormat token123';

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Token inválido'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if token is expired', () => {
    const expiredToken = jwt.sign(
      { userId: 'user-123' },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' } // Already expired
    );

    req.headers.authorization = `Bearer ${expiredToken}`;

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Token expirado o inválido'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if token is invalid', () => {
    req.headers.authorization = 'Bearer invalid.token.here';

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Token expirado o inválido'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle token without Bearer prefix', () => {
    const token = jwt.sign(
      { userId: 'user-123', email: 'test@example.com' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    req.headers.authorization = token;

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
