# AGENTS.md - Guidelines for AI Coding Agents

## Project Overview

**Libreta de Pinturas de Modelismo & Miniaturas** - A web application for managing a personal paint inventory with AI-assisted mix generation.

- **Frontend**: React SPA with Vite and TailwindCSS
- **Backend**: Node.js REST API
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT-based
- **AI Integration**: Gemini API (or similar)

## Build Commands

```bash
# Frontend
cd frontend
npm install
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build

# Backend
cd backend
npm install
npx prisma migrate dev    # Run database migrations
npx prisma generate       # Generate Prisma client
npm run dev               # Start dev server with hot reload
npm run start             # Start production server
```

## Lint/Test Commands

```bash
# Run all tests
npm run test

# Run single test file
npm run test -- PaintCard.test.jsx

# Run tests in watch mode
npm run test -- --watch

# Run tests matching pattern
npm run test -- --grep "PaintCard"

# Linting
npm run lint              # Check for linting errors
npm run lint:fix          # Fix auto-fixable linting errors

# Formatting
npm run format            # Format all files with Prettier
npm run format:check      # Check formatting without fixing
```

## Code Style Guidelines

### General

- Use **ES6+** syntax consistently
- Prefer `const` and `let` over `var`
- Use strict equality (`===`, `!==`)
- Maximum line length: 100 characters
- Use 2 spaces for indentation

### Imports

```javascript
// Order: React/core libs → third-party → local modules → relative imports
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { PaintCard } from './PaintCard';

// Use absolute imports with @/ alias for src directory
import { Button } from '@/components/ui/Button';
```

### Naming Conventions

- **Components**: PascalCase (`PaintCard`, `MixGenerator`)
- **Functions/Variables**: camelCase (`getPaintById`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_PAINTS`)
- **Files**: PascalCase for components, camelCase for utilities
- **API endpoints**: kebab-case (`/api/paint-mixes`)

### TypeScript (if applicable)

```typescript
// Use explicit types for function parameters and returns
interface Paint {
  id: string;
  brand: string;
  name: string;
  color: string;
  isMix: boolean;
}

// Prefer interfaces over type aliases for object shapes
// Use union types for limited options
type PaintType = 'commercial' | 'mix';
```

### React Components

```javascript
// Use functional components with hooks
function PaintList({ paints, onSelect }) {
  // Destructure props at parameter level when possible
  // Use custom hooks for complex logic
  const { data, isLoading } = usePaints();
  
  // Event handlers prefixed with 'handle'
  const handleSelect = (paint) => {
    onSelect(paint);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {paints.map(paint => (
        <PaintCard 
          key={paint.id} 
          paint={paint} 
          onClick={handleSelect}
        />
      ))}
    </div>
  );
}
```

### TailwindCSS

```jsx
// Use Tailwind utility classes
// Group related classes, responsive modifiers at the end
<button className="
  px-4 py-2 
  bg-blue-600 hover:bg-blue-700 
  text-white font-medium 
  rounded-lg 
  transition-colors
  disabled:opacity-50
  md:px-6
">
  Guardar
</button>

// Extract repeated patterns to components, not custom CSS
```

### Backend (Node.js/Express)

```javascript
// Controllers: async functions with try/catch
async function getPaints(req, res, next) {
  try {
    const userId = req.user.id; // From JWT context
    const paints = await paintService.getByUser(userId);
    res.json({ success: true, data: paints });
  } catch (error) {
    next(error);
  }
}

// Services: Business logic, database calls via Prisma
async function createPaint(userId, paintData) {
  return await prisma.paint.create({
    data: {
      ...paintData,
      userId,
    },
  });
}
```

### Validation (Zod)

```javascript
// schemas/paint.schema.js - Define validation schemas
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

// Backend middleware
const validate = (schema) => (req, res, next) => {
  try {
    req.validated = schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: error.errors
    });
  }
};
```

### Error Handling

```javascript
// Backend: Consistent error responses
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Frontend: Handle errors with Sonner toasts
import { toast } from 'sonner';

function useApi() {
  const handleError = (err) => {
    if (err.response?.status === 401) {
      toast.error('Sesión expirada. Por favor, inicia sesión.');
    } else {
      toast.error(err.response?.data?.error || 'Ha ocurrido un error');
    }
  };
  
  return { handleError };
}
```

### State Management (TanStack Query)

```javascript
// hooks/usePaints.js - Server state management
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function usePaints(filters = {}) {
  return useQuery({
    queryKey: ['paints', filters],
    queryFn: () => api.get('/paints', { params: filters }).then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreatePaint() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (paintData) => api.post('/paints', paintData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paints'] });
      toast.success('Pintura creada');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al crear pintura');
    },
  });
}
```

### Testing

```javascript
// Test naming: should [expected behavior] when [condition]
import { render, screen } from '@testing-library/react';

describe('PaintCard', () => {
  it('should display paint name and brand', () => {
    const paint = { name: 'German Grey', brand: 'Vallejo' };
    render(<PaintCard paint={paint} />);
    
    expect(screen.getByText('German Grey')).toBeInTheDocument();
    expect(screen.getByText('Vallejo')).toBeInTheDocument();
  });
});
```

## Architecture References

### ADRs (Architecture Decision Records)
Consultar en `/ADRs/`:
- **ADR-001**: General architecture (React SPA + Node.js API)
- **ADR-002**: Database (SQLite with Prisma)
- **ADR-003**: Domain model (Paint entity, Mixes are Paints)
- **ADR-004**: REST API design and endpoints
- **ADR-005**: AI integration patterns (incluye arquitectura de servicio propio)
- **ADR-006**: Import/Export functionality
- **ADR-007**: Authentication (JWT)
- **ADR-008**: UX principles
- **ADR-009**: Deployment strategy (ifastnet/cPanel + PM2)
- **ADR-010**: Testing strategy (Jest + Playwright)
- **ADR-011**: State management (TanStack Query + Context)
- **ADR-012**: Validation & error handling (Zod + Pino + Sonner)
- **ADR-013**: Security & environment configuration

### Roadmap
Consultar `task.md` para el listado completo de tareas organizadas por fases:
- 12 fases de desarrollo
- ~267 tareas TDD
- Seguimiento de progreso
- Convenciones de commit

## Key Principles

1. **REST API**: Use standard HTTP methods, JSON payloads, clear resource naming
2. **Authentication**: JWT tokens, user context from session never from payload
3. **Database**: Prisma ORM, SQLite for simplicity, migrations for schema changes
4. **AI Integration**: Backend-only access, JSON structured responses, user confirmation required
5. **State Management**: React hooks for local state, TanStack Query for server state, React Context for global state
6. **Error Handling**: Graceful degradation, user-friendly messages with Sonner toasts, detailed server logging with Pino
7. **Validation**: Use Zod for all data validation (both frontend forms and backend API)
8. **Security**: Rate limiting, helmet headers, CORS configuration, environment validation
9. **Testing**: 70% coverage minimum - unit tests (Jest), integration tests (Supertest), E2E tests (Playwright)
10. **TDD (Test-Driven Development)**: Cada feature se desarrolla siguiendo el ciclo RED → GREEN → REFACTOR

## Test-Driven Development (TDD)

Este proyecto sigue **TDD estricto** para todas las funcionalidades.

### Ciclo TDD

```
┌─────────┐    ┌──────────┐    ┌───────────┐
│  RED    │ →  │  GREEN   │ →  │ REFACTOR  │
└─────────┘    └──────────┘    └───────────┘
    │              │                │
    ▼              ▼                ▼
Escribir test   Implementar      Mejorar
que falla       código mínimo    código
```

### Flujo de Trabajo

1. **RED**: Escribir un test que describa el comportamiento esperado (y falla inicialmente)
2. **GREEN**: Implementar el código mínimo necesario para que el test pase
3. **REFACTOR**: Limpiar y mejorar el código manteniendo los tests verdes
4. **COMMIT**: Hacer commit una vez que todo funciona

### Ejemplo Práctico

```javascript
// 1. RED: Escribir test (falla porque no existe la implementación)
// paintService.test.js
describe('createPaint', () => {
  it('should create a paint with valid data', async () => {
    const paintData = { brand: 'Vallejo', name: 'Test', color: '#FF0000' };
    const result = await createPaint('user-123', paintData);
    expect(result).toHaveProperty('id');
    expect(result.brand).toBe('Vallejo');
  });
});

// 2. GREEN: Implementar código mínimo
// paintService.js
async function createPaint(userId, paintData) {
  return await prisma.paint.create({
    data: { ...paintData, userId }
  });
}

// 3. REFACTOR: Mejorar si es necesario (extraer validación, etc.)
// 4. COMMIT: git commit -m "[T3.8] Feat: Implement createPaint service"
```

### Reglas de TDD

- **Nunca escribir código nuevo sin un test que falle primero**
- **Tests son especificaciones ejecutables**: Describen el comportamiento esperado
- **Mantener tests rápidos**: Usar mocks para servicios externos (DB, IA, etc.)
- **Un test por comportamiento**: No testear implementación, testear comportamiento
- **Commit frecuentes**: Después de cada ciclo GREEN
- **Refactor con confianza**: Los tests garantizan que no se rompe nada

### Testing Pirámide

```
       /\
      /  \     E2E (Playwright)
     /____\        ~10% de tests
    /      \
   /        \   Integration (Supertest)
  /__________\      ~20% de tests
 /            \
/______________\  Unit (Jest + RTL)
                    ~70% de tests
```

### Tipos de Tests

1. **Unit Tests**: Testear funciones/servicios/componentes individualmente
2. **Integration Tests**: Testear endpoints API con base de datos real
3. **E2E Tests**: Testear flujos completos de usuario con Playwright

### Cobertura Mínima

- **Unit tests**: 70% mínimo
- **Integration tests**: Todos los endpoints críticos
- **E2E tests**: Flujos principales (login, CRUD, generar mezcla)

### Documentación

- Ver roadmap completo en `task.md`
- Cada tarea sigue el formato: `[FASE.TAREA] Tipo: Descripción`
- Los tipos son: Test, Feat, Fix, Refactor, Docs

## Environment Variables

### Backend (.env.development / .env.production)
```bash
NODE_ENV=development
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-secret-key-min-32-chars
AI_API_KEY=your-gemini-key
AI_URL=urp api IA
AI_MODEL=model-user
AI_PROVIDER=gemini
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
```

### Frontend (.env.development / .env.production)
```bash
VITE_API_URL=http://localhost:3000/api
```

**Important**: Never commit .env files! Use .env.example as a template.
