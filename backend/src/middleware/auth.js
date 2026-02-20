const jwt = require('jsonwebtoken');
const { validateEnv } = require('../config/env');

const { JWT_SECRET } = validateEnv();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Token requerido'
    });
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }

  const token = parts[1];

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Token expirado o inválido'
      });
    }

    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
