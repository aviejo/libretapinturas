const express = require('express');
const { validateEnv } = require('./config/env');
const { prisma } = require('./config/database');
const securityMiddleware = require('./middleware/security');
const corsMiddleware = require('./middleware/cors');
const { apiLimiter } = require('./middleware/rateLimit');
const logger = require('./config/logger');

// Routes
const authRoutes = require('./routes/auth.routes');
const paintRoutes = require('./routes/paint.routes');
const mixRoutes = require('./routes/mix.routes');
const exportRoutes = require('./routes/export.routes');
const importRoutes = require('./routes/import.routes');

const env = validateEnv();
const app = express();
const PORT = env.PORT || 3000;

// Middleware
app.use(securityMiddleware);
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);

// Health check (accessible at /api/health for production)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Also keep root health check for development/testing
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), mode: 'development' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/paints', paintRoutes);
app.use('/api/mixes', mixRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/import', importRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado'
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    statusCode: err.statusCode || 500,
  }, 'Unhandled error');
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : err.message
  });
});

// Start server
const server = app.listen(PORT, () => {
  const protocol = env.NODE_ENV === 'production' ? 'https' : 'http';
  const host = 'localhost';
  const baseUrl = `${protocol}://${host}:${PORT}`;
  
  logger.info('╔════════════════════════════════════════════════╗');
  logger.info('║        🎨 LIBRETA DE PINTURAS API 🎨           ║');
  logger.info('╚════════════════════════════════════════════════╝');
  logger.info({ url: baseUrl, environment: env.NODE_ENV, database: env.DATABASE_URL }, 'Server started');
  logger.info('📚 Available Endpoints:');
  logger.info(`   • ${baseUrl}/health                    → Health check`);
  logger.info(`   • ${baseUrl}/api/auth/register         → Register user`);
  logger.info(`   • ${baseUrl}/api/auth/login            → Login user`);
  logger.info(`   • ${baseUrl}/api/auth/me               → Get current user`);
  logger.info(`   • ${baseUrl}/api/paints                → List paints`);
  logger.info(`   • ${baseUrl}/api/paints/:id            → Get/Update/Delete paint`);
  logger.info(`   • ${baseUrl}/api/mixes/generate        → Generate paint mix (AI)`);
  logger.info(`   • ${baseUrl}/api/export                → Export collection (JSON)`);
  logger.info(`   • ${baseUrl}/api/import                → Import collection (JSON)`);
  logger.info('✨ Server is ready!');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;
