# ADR-010: Estrategia de Testing

## Contexto

La aplicación requiere una estrategia de testing completa que garantice:
- Calidad del código
- Prevención de regresiones
- Confianza en los despliegues
- Documentación viva del comportamiento esperado

## Decisión

Se adopta una **pirámide de testing** con tres niveles:

1. **Unit Tests**: Jest + React Testing Library (frontend) / Jest (backend)
2. **Integration Tests**: Supertest para API endpoints
3. **E2E Tests**: Playwright para flujos críticos de usuario

## Cobertura Esperada

- **Unit tests**: 70% mínimo
- **Integration tests**: Todos los endpoints críticos
- **E2E tests**: Flujos principales (login, CRUD pinturas, generar mezcla)

## Frontend Testing

### Unit Tests con React Testing Library

```javascript
// PaintCard.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaintCard } from './PaintCard';

describe('PaintCard', () => {
  const mockPaint = {
    id: '1',
    brand: 'Vallejo',
    name: 'German Grey',
    color: '#5b5f4a',
    inStock: true
  };

  it('should display paint name and brand', () => {
    render(<PaintCard paint={mockPaint} />);
    
    expect(screen.getByText('German Grey')).toBeInTheDocument();
    expect(screen.getByText('Vallejo')).toBeInTheDocument();
  });

  it('should call onClick when card is clicked', async () => {
    const handleClick = jest.fn();
    render(<PaintCard paint={mockPaint} onClick={handleClick} />);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledWith(mockPaint);
  });
});
```

### Custom Hooks Testing

```javascript
// usePaints.test.js
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePaints } from './usePaints';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('usePaints', () => {
  it('should fetch paints', async () => {
    const { result } = renderHook(() => usePaints(), { wrapper });
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
```

## Backend Testing

### Unit Tests para Servicios

```javascript
// paintService.test.js
const { createPaint, getPaintsByUser } = require('./paintService');
const { prisma } = require('../config/database');

jest.mock('../config/database', () => ({
  prisma: {
    paint: {
      create: jest.fn(),
      findMany: jest.fn()
    }
  }
}));

describe('paintService', () => {
  describe('createPaint', () => {
    it('should create a paint with valid data', async () => {
      const userId = 'user-123';
      const paintData = {
        brand: 'Vallejo',
        name: 'German Grey',
        color: '#5b5f4a'
      };

      prisma.paint.create.mockResolvedValue({
        id: 'paint-123',
        ...paintData,
        userId
      });

      const result = await createPaint(userId, paintData);
      
      expect(result).toHaveProperty('id');
      expect(result.brand).toBe('Vallejo');
    });
  });
});
```

### Integration Tests con Supertest

```javascript
// paints.routes.test.js
const request = require('supertest');
const app = require('../app');
const { prisma } = require('../config/database');

describe('POST /api/paints', () => {
  let authToken;

  beforeAll(async () => {
    // Login and get token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'password' });
    authToken = response.body.token;
  });

  it('should create a new paint', async () => {
    const response = await request(app)
      .post('/api/paints')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        brand: 'Vallejo',
        name: 'Test Paint',
        color: '#FF0000',
        isMix: false
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.name).toBe('Test Paint');
  });

  it('should reject invalid paint data', async () => {
    const response = await request(app)
      .post('/api/paints')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        brand: '',
        name: ''
      });

    expect(response.status).toBe(400);
  });
});
```

## E2E Testing con Playwright

```javascript
// e2e/paint-flow.spec.js
import { test, expect } from '@playwright/test';

test.describe('Paint Management Flow', () => {
  test('user can create and view a paint', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Create paint
    await page.click('text=Nueva Pintura');
    await page.fill('[name="brand"]', 'Vallejo');
    await page.fill('[name="name"]', 'E2E Test Paint');
    await page.fill('[name="color"]', '#00FF00');
    await page.click('text=Guardar');
    
    // Verify paint appears in list
    await expect(page.locator('text=E2E Test Paint')).toBeVisible();
  });

  test('AI mix generation flow', async ({ page }) => {
    await page.goto('/mixes/new');
    await page.fill('[name="target_brand"]', 'Vallejo');
    await page.fill('[name="target_name"]', 'German Field Grey');
    await page.click('text=Generar Mezcla');
    
    // Wait for AI response
    await expect(page.locator('.recipe-preview')).toBeVisible();
    
    // Save mix
    await page.click('text=Guardar Mezcla');
    await expect(page.locator('text=Mezcla guardada')).toBeVisible();
  });
});
```

## Configuración de Testing

### Jest Config (Frontend)
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/main.jsx'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

### Jest Config (Backend)
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

### Playwright Config
```javascript
// playwright.config.js
module.exports = {
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    }
  ]
};
```

## Estructura de Carpetas de Tests

```
frontend/
├── src/
│   └── components/
│       └── PaintCard/
│           ├── PaintCard.jsx
│           └── PaintCard.test.jsx
└── e2e/
    ├── auth.spec.js
    ├── paints.spec.js
    └── mix-generation.spec.js

backend/
├── src/
│   ├── services/
│   │   └── paintService.test.js
│   └── routes/
│       └── paints.routes.test.js
└── tests/
    ├── setup.js
    └── fixtures/
```

## Comandos de Testing

```bash
# Frontend
cd frontend
npm run test                    # Run all tests
npm run test -- PaintCard       # Run single test file
npm run test -- --watch         # Watch mode
npm run test -- --coverage      # With coverage

# Backend
cd backend
npm run test                    # Run all tests
npm run test -- paintService    # Run specific test
npm run test -- --coverage      # With coverage

# E2E
cd frontend
npx playwright test             # Run all E2E tests
npx playwright test --ui        # Run with UI
npx playwright test --headed    # Run headed mode
```

## Justificación

- **Jest**: Framework estándar, buena integración con React/Node
- **React Testing Library**: Fomenta testing de comportamiento, no implementación
- **Supertest**: Testing de HTTP sin necesidad de servidor real
- **Playwright**: E2E moderno, rápido y confiable
- **70% coverage**: Balance entre calidad y velocidad de desarrollo

## Consecuencias

### Positivas
- Código más robusto y mantenible
- Detección temprana de regresiones
- Documentación viva del sistema
- Mayor confianza en refactorizaciones

### Negativas
- Tiempo adicional en desarrollo (~20-30%)
- Mantenimiento de tests
- Configuración inicial compleja

## Plan de Testing

1. **Fase 1**: Unit tests para componentes críticos y servicios
2. **Fase 2**: Integration tests para endpoints principales
3. **Fase 3**: E2E tests para flujos completos
4. **Continuo**: Todos los tests en CI/CD antes de cada merge
