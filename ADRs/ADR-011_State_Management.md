# ADR-011: Gestión de Estado (State Management)

## Contexto

La aplicación requiere una estrategia de gestión de estado que:
- Maneje datos del servidor de forma eficiente
- Minimice código boilerplate
- Soporte caché, reintentos y sincronización
- Sea simple de mantener

## Decisión

Se adopta **TanStack Query (React Query v5)** como solución principal para estado del servidor, complementada con **React Context** para estado global simple y **React Hooks** para estado local.

## Jerarquía de Estado

```
┌─────────────────────────────────────┐
│  Estado del Servidor (Server State) │
│  TanStack Query                     │
├─────────────────────────────────────┤
│  Estado Global (Global State)       │
│  React Context                      │
├─────────────────────────────────────┤
│  Estado Local (Local State)         │
│  useState / useReducer              │
└─────────────────────────────────────┘
```

## TanStack Query (Estado del Servidor)

### Instalación
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### Configuración
```javascript
// src/lib/queryClient.js
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// main.jsx
import { QueryClientProvider } from '@tanstack/react-query';

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### Custom Hooks con TanStack Query

```javascript
// src/hooks/usePaints.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

const PAINTS_KEY = 'paints';

export function usePaints(filters = {}) {
  return useQuery({
    queryKey: [PAINTS_KEY, filters],
    queryFn: () => api.get('/paints', { params: filters }).then(res => res.data),
  });
}

export function useCreatePaint() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (paintData) => api.post('/paints', paintData),
    onSuccess: () => {
      // Invalidar y refetch automático
      queryClient.invalidateQueries({ queryKey: [PAINTS_KEY] });
    },
  });
}

export function useDeletePaint() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => api.delete(`/paints/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAINTS_KEY] });
    },
  });
}

export function usePaint(id) {
  return useQuery({
    queryKey: [PAINTS_KEY, id],
    queryFn: () => api.get(`/paints/${id}`).then(res => res.data),
    enabled: !!id,
  });
}
```

### Uso en Componentes

```javascript
// PaintList.jsx
import { usePaints } from '@/hooks/usePaints';

function PaintList() {
  const { data: paints, isLoading, error } = usePaints();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {paints?.map(paint => (
        <PaintCard key={paint.id} paint={paint} />
      ))}
    </div>
  );
}

// CreatePaintForm.jsx
import { useCreatePaint } from '@/hooks/usePaints';

function CreatePaintForm() {
  const createPaint = useCreatePaint();
  
  const handleSubmit = async (data) => {
    try {
      await createPaint.mutateAsync(data);
      toast.success('Pintura creada');
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={createPaint.isPending}>
        {createPaint.isPending ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
}
```

## React Context (Estado Global)

### Uso Recomendado
Context solo para estado que necesita ser accesible en muchos componentes:
- Autenticación (usuario actual)
- Tema (dark/light mode)
- Configuración global

### Ejemplo: Auth Context

```javascript
// src/contexts/AuthContext.jsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    setUser(response.data.user);
    localStorage.setItem('token', response.data.token);
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

## React Hooks (Estado Local)

### Uso de useState

```javascript
function PaintCard({ paint }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  return (
    <div>
      <h3 onClick={() => setIsExpanded(!isExpanded)}>
        {paint.name}
      </h3>
      {isExpanded && <PaintDetails paint={paint} />}
    </div>
  );
}
```

### Uso de useReducer (estado complejo)

```javascript
// Para formularios complejos con múltiples campos
function paintFormReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

function MixForm() {
  const [state, dispatch] = useReducer(paintFormReducer, initialState);
  
  const handleChange = (field, value) => {
    dispatch({ type: 'SET_FIELD', field, value });
  };
}
```

## Estructura de Carpetas

```
src/
├── contexts/
│   └── AuthContext.jsx
├── hooks/
│   ├── usePaints.js
│   ├── useAuth.js
│   └── useTheme.js
├── lib/
│   └── queryClient.js
└── services/
    └── api.js
```

## Reglas de Oro

1. **TanStack Query primero**: Si el estado viene del servidor, usa TanStack Query
2. **Context con moderación**: No envuelvas toda la app en Context, usa solo donde sea necesario
3. **useState para local**: Estado que no necesita persistir ni compartirse
4. **Invalidación manual**: Cuando mutaciones afecten a múltiples queries, invalida manualmente

## Justificación

- **TanStack Query**: Estandar de facto para estado del servidor, maneja caché, reintentos, deduplicación
- **React Context**: Nativo, sin dependencias adicionales, perfecto para estado global simple
- **React Hooks**: Simplicidad máxima para estado local
- **Sin Redux**: Reduce boilerplate, más simple para el alcance del proyecto

## Consecuencias

### Positivas
- Menos código boilerplate que Redux
- Caché inteligente automática
- Reintentos y manejo de errores integrados
- Estado del servidor y local bien separados

### Negativas
- Curva de aprendizaje de TanStack Query
- Context puede causar re-renders si no se usa bien
- Menos control fino que Redux en casos complejos

## Notas

- Usar React Query Devtools en desarrollo para debugging
- Mantener las queries simples y enfocadas
- Documentar los query keys para facilitar invalidaciones
