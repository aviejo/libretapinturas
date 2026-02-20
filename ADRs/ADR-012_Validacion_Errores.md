# ADR-012: Validación y Manejo de Errores

## Contexto

La aplicación requiere:
- Validación robusta de datos en frontend y backend
- Manejo consistente de errores
- Feedback claro al usuario
- Logging estructurado para debugging

## Decisión

Se adopta:
- **Zod**: Validación de schemas TypeScript-first
- **Pino**: Logging estructurado en backend
- **Sonner**: Toast notifications en frontend
- **React Error Boundaries**: Captura de errores de React

## Zod (Validación)

### Instalación
```bash
# Frontend y Backend
npm install zod
```

### Schemas de Validación

```javascript
// src/schemas/paint.schema.js
import { z } from 'zod';

export const paintSchema = z.object({
  brand: z.string().min(1, 'La marca es requerida'),
  reference: z.string().optional(),
  name: z.string().min(1, 'El nombre es requerido'),
  isMix: z.boolean().default(false),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color debe ser hexadecimal'),
  notes: z.string().optional(),
  inStock: z.boolean().default(true),
});

export const mixRecipeSchema = z.object({
  components: z.array(z.object({
    paintId: z.string().uuid(),
    drops: z.number().int().positive(),
  })).min(2, 'Mínimo 2 componentes'),
  notes: z.string().optional(),
});

export const createPaintSchema = paintSchema.extend({
  recipe: mixRecipeSchema.optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export const generateMixSchema = z.object({
  targetBrand: z.string().min(1),
  targetName: z.string().min(1),
});
```

### Validación en Backend

```javascript
// middleware/validate.js
const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      req.validated = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
};

// Uso en rutas
app.post('/api/paints', validate({ body: createPaintSchema }), createPaintHandler);
```

### Validación en Frontend

```javascript
// hooks/useForm.js
import { useState } from 'react';
import { z } from 'zod';

export function useForm(schema, onSubmit) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // Limpiar error al editar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const validated = schema.parse(values);
      await onSubmit(validated);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = {};
        error.errors.forEach(err => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return { values, errors, isSubmitting, handleChange, handleSubmit };
}

// Uso
const { values, errors, handleChange, handleSubmit } = useForm(createPaintSchema, onSubmit);
```

## Pino (Logging)

### Instalación
```bash
npm install pino pino-pretty
```

### Configuración

```javascript
// config/logger.js
const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
});

module.exports = logger;
```

### Uso en Backend

```javascript
// controllers/paintController.js
const logger = require('../config/logger');

async function createPaint(req, res, next) {
  logger.info({ userId: req.user.id }, 'Creating new paint');
  
  try {
    const paint = await paintService.create(req.user.id, req.body);
    logger.info({ paintId: paint.id }, 'Paint created successfully');
    res.status(201).json({ success: true, data: paint });
  } catch (error) {
    logger.error({ error: error.message, userId: req.user.id }, 'Failed to create paint');
    next(error);
  }
}

// middleware/errorHandler.js
const logger = require('../config/logger');

function errorHandler(err, req, res, next) {
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  }, 'Unhandled error');
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
}
```

## Sonner (Toast Notifications)

### Instalación
```bash
npm install sonner
```

### Configuración

```javascript
// App.jsx
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      <Router />
    </>
  );
}
```

### Uso en Componentes

```javascript
import { toast } from 'sonner';

// Éxito
toast.success('Pintura creada correctamente');

// Error
toast.error('Error al guardar la pintura');

// Con descripción
toast.success('Mezcla guardada', {
  description: 'German Field Grey (Mix)',
});

// En hooks con TanStack Query
const createPaint = useMutation({
  mutationFn: api.createPaint,
  onSuccess: () => {
    toast.success('Pintura creada');
    queryClient.invalidateQueries(['paints']);
  },
  onError: (error) => {
    toast.error(error.response?.data?.error || 'Error al crear pintura');
  },
});
```

## React Error Boundaries

```javascript
// components/ErrorBoundary.jsx
import { Component } from 'react';
import { toast } from 'sonner';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    toast.error('Ha ocurrido un error inesperado');
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold mb-4">Algo salió mal</h2>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Recargar página
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Uso en main.jsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

## Estructura de Errores

### Errores de Negocio
```javascript
// errors/AppError.js
class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Uso
throw new AppError('Pintura no encontrada', 404, 'PAINT_NOT_FOUND');
```

### Manejo de Errores de API
```javascript
// services/api.js
import axios from 'axios';
import { toast } from 'sonner';

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      toast.error('Sesión expirada. Por favor, inicia sesión de nuevo.');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      toast.error('No tienes permiso para realizar esta acción');
    } else if (error.response?.status >= 500) {
      toast.error('Error del servidor. Inténtalo más tarde.');
    }
    
    return Promise.reject(error);
  }
);
```

## Justificación

- **Zod**: TypeScript-first, errores descriptivos, composable
- **Pino**: Rápido, estructurado, pretty printing en dev
- **Sonner**: Moderno, simple, buena UX
- **Error Boundaries**: Captura errores de renderizado, evita crashes totales

## Consecuencias

### Positivas
- Validación consistente frontend/backend
- Errores claros para el usuario
- Logging detallado para debugging
- Recuperación graceful de errores

### Negativas
- Curva de aprendizaje de Zod
- Configuración inicial de Pino
- Necesidad de mantener schemas sincronizados

## Ejemplo Completo: Flujo de Error

```javascript
// 1. Usuario envía formulario inválido
// 2. Zod valida en frontend, muestra errores inline
// 3. Si pasa frontend, Zod valida en backend middleware
// 4. Si hay error de negocio, AppError con status code apropiado
// 5. API interceptor captura error y muestra toast
// 6. Pino loggea error con contexto
// 7. Si es error de render, ErrorBoundary captura y muestra UI de fallback
```
