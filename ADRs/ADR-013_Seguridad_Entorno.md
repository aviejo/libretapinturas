# ADR-013: Seguridad y Configuración de Entorno

## Contexto

La aplicación requiere:
- Protección contra ataques comunes
- Gestión segura de variables de entorno
- Control de acceso a la API
- Separación clara entre entornos

## Decisión

Se adopta:
- **express-rate-limit**: Protección contra brute force y DoS
- **helmet**: Headers de seguridad HTTP
- **CORS**: Configuración estricta de orígenes permitidos
- **Zod**: Validación de variables de entorno
- **Separación de .env**: Archivos por entorno

## express-rate-limit

### Instalación
```bash
npm install express-rate-limit
```

### Configuración

```javascript
// middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

// Límite general de API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message: {
    success: false,
    error: 'Demasiadas peticiones. Intenta más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Límite estricto para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 intentos de login por 15 min
  message: {
    success: false,
    error: 'Demasiados intentos de login. Intenta en 15 minutos.',
  },
  skipSuccessfulRequests: true, // No contar logins exitosos
});

// Límite específico para IA (costoso)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 generaciones por hora
  message: {
    success: false,
    error: 'Límite de generaciones alcanzado. Máximo 10 por hora.',
  },
  keyGenerator: (req) => req.user.id, // Por usuario, no por IP
});

module.exports = { apiLimiter, authLimiter, aiLimiter };
```

### Uso

```javascript
// server.js
const { apiLimiter, authLimiter, aiLimiter } = require('./middleware/rateLimit');

// Aplicar a todas las rutas API
app.use('/api/', apiLimiter);

// Más estricto en auth
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Específico para IA
app.use('/api/mixes/generate', aiLimiter);
```

## Helmet

### Instalación
```bash
npm install helmet
```

### Configuración

```javascript
// middleware/security.js
const helmet = require('helmet');

const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Tailwind necesita inline
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.CORS_ORIGIN],
    },
  },
  crossOriginEmbedderPolicy: false, // Permitir recursos externos si es necesario
});

module.exports = securityMiddleware;
```

### Uso

```javascript
// server.js
const securityMiddleware = require('./middleware/security');

app.use(securityMiddleware);
```

## CORS

### Instalación
```bash
npm install cors
```

### Configuración

```javascript
// middleware/cors.js
const cors = require('cors');

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = cors(corsOptions);
```

## Validación de Variables de Entorno

```javascript
// config/env.js
const { z } = require('zod');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  AI_API_KEY: z.string().min(1),
  AI_PROVIDER: z.enum(['gemini', 'openai']).default('gemini'),
  CORS_ORIGIN: z.string().url(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Variables de entorno inválidas:');
    error.errors.forEach(err => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
}

const env = validateEnv();
module.exports = env;
```

### Uso

```javascript
// En lugar de process.env.PORT
const { PORT, DATABASE_URL } = require('./config/env');
```

## Estructura de Archivos .env

### .env.development (desarrollo local)
```bash
NODE_ENV=development
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET=dev-secret-key-minimo-32-caracteres
AI_API_KEY=tu-gemini-api-key
AI_PROVIDER=gemini
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
```

### .env.production (producción)
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL="file:./data/dev.db"
JWT_SECRET=tu-clave-super-segura-de-32-caracteres-o-mas
AI_API_KEY=tu-gemini-api-key-produccion
AI_PROVIDER=gemini
CORS_ORIGIN=https://tudominio.com
LOG_LEVEL=error
```

### .env.test (testing)
```bash
NODE_ENV=test
PORT=3001
DATABASE_URL="file:./test.db"
JWT_SECRET=test-secret-key
AI_API_KEY=test-key
AI_PROVIDER=gemini
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=silent
```

## Scripts de Configuración

```javascript
// package.json
{
  "scripts": {
    "dev": "NODE_ENV=development node -r dotenv/config server.js dotenv_config_path=.env.development",
    "start": "NODE_ENV=production node server.js",
    "test": "NODE_ENV=test jest"
  }
}
```

## Seguridad Adicional

### Sanitización de Inputs
```javascript
// middleware/sanitize.js
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

app.use(mongoSanitize()); // Prevenir NoSQL injection
app.use(xss()); // Prevenir XSS
```

### Validación de JWT
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Token requerido' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
```

### Headers de Seguridad Personalizados
```javascript
// middleware/customHeaders.js
function customHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}

module.exports = customHeaders;
```

## Checklist de Seguridad

### Desarrollo
- [ ] Validar todas las variables de entorno al iniciar
- [ ] Usar HTTPS en producción
- [ ] Implementar rate limiting
- [ ] Configurar CORS correctamente
- [ ] Validar todos los inputs con Zod
- [ ] Sanitizar datos antes de guardar
- [ ] Hashear contraseñas con bcrypt
- [ ] Usar JWT con expiración
- [ ] No loggear datos sensibles
- [ ] Implementar error boundaries

### Producción
- [ ] Cambiar JWT_SECRET (mínimo 32 caracteres)
- [ ] Usar API keys de producción
- [ ] Configurar CORS_ORIGIN correcto
- [ ] Habilitar solo logs de error
- [ ] Configurar backups automáticos
- [ ] Revisar permisos de archivos
- [ ] Mantener dependencias actualizadas

## Justificación

- **express-rate-limit**: Protección simple y efectiva contra abuso
- **helmet**: Headers de seguridad recomendados por OWASP
- **CORS**: Control explícito de orígenes permitidos
- **Zod**: Validación TypeScript-first, errores claros
- **Separación de .env**: Evita mezclar configuraciones

## Consecuencias

### Positivas
- Protección contra ataques comunes
- Configuración clara por entorno
- Validación temprana de variables
- Cumplimiento de buenas prácticas de seguridad

### Negativas
- Configuración inicial más compleja
- Mantenimiento de múltiples archivos .env
- Posible bloqueo de requests legítimas si rate limiting es muy estricto

## Notas Importantes

1. **Nunca commitear** archivos .env al repositorio
2. Usar `.env.example` como plantilla sin valores reales
3. Rotar JWT_SECRET y API keys periódicamente
4. Monitorear logs de rate limiting para ajustar límites
5. En desarrollo, usar valores dummy para servicios externos
