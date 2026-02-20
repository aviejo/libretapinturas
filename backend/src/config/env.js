const { z } = require('zod');
const logger = require('./logger');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  AI_API_KEY: z.string().optional(), // Optional for local providers like LLMStudio
  AI_URL: z.string().url().optional(),
  AI_MODEL: z.string().optional(),
  AI_PROVIDER: z.enum(['gemini', 'llmstudio', 'openai']).default('gemini'),
  CORS_ORIGIN: z.string().url(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'silent']).default('info'),
}).refine((data) => {
  // AI_API_KEY is required for cloud providers (gemini, openai)
  // But optional for local providers (llmstudio)
  if (data.AI_PROVIDER !== 'llmstudio' && !data.AI_API_KEY) {
    return false;
  }
  return true;
}, {
  message: 'AI_API_KEY es requerido para proveedores cloud (gemini, openai)',
  path: ['AI_API_KEY'],
});

function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    logger.info({ nodeEnv: env.NODE_ENV, port: env.PORT }, 'Environment variables validated successfully');
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('❌ Variables de entorno inválidas:');
      if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach(err => {
          const path = err.path ? err.path.join('.') : 'unknown';
          logger.error({ path, message: err.message }, 'Invalid environment variable');
        });
      } else if (error.message) {
        logger.error({ message: error.message }, 'Environment validation error');
      }
      throw new Error(error.errors?.[0]?.message || error.message || 'Invalid environment variables');
    }
    logger.error({ error: error.message }, 'Unexpected error during environment validation');
    throw error;
  }
}

module.exports = { validateEnv };
