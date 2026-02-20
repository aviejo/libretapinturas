const cors = require('cors');
const { validateEnv } = require('../config/env');

// Validate env to get CORS_ORIGIN
const env = validateEnv();

const corsOptions = {
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = cors(corsOptions);
