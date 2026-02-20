# Libreta de Pinturas – Modelismo & Miniaturas


Aplicación web para la gestión de una libreta personal de pinturas de modelismo y escenografía, con soporte para mezclas personalizadas y generación asistida mediante IA.

El proyecto está diseñado para ser simple, mantenible y portable, evitando sobreingeniería y priorizando la experiencia del usuario.

---

## 🌐 Demo en Vivo

**URL de Producción:** https://app.tupintacomoquieras.com/

Aplicación desplegada y funcionando en hosting compartido con cPanel.

**URL video demo:** https://app.tupintacomoquieras.com/demo-player.html

---

## 📖 Descripción General

Libreta de Pinturas es una aplicación web diseñada para modelistas y pintores de miniaturas que permite:

- **Gestión personal de inventario:** Registrar, organizar y buscar pinturas comerciales de cualquier marca
- **Creación de mezclas personalizadas:** Generar y guardar recetas de colores mezclados
- **Asistencia de IA:** Generar mezclas automáticamente describiendo el color deseado
- **Portabilidad:** Exportar e importar la colección completa en formato JSON

Competencias full-stack, integración con APIs de IA, arquitectura REST, autenticación JWT, y despliegue en producción.

---
## 🧱 Arquitectura

Arquitectura web cliente-servidor con separación clara de responsabilidades:

[ React SPA ]
|
[ Node.js API ]
|
[ SQLite ]
|
[ API IA ]

## 🧱 Stack Tecnológico

### Frontend
- **React 19** – Framework UI moderno con hooks
- **Vite** – Build tool rápido y eficiente
- **TailwindCSS 4** – Framework CSS utility-first
- **React Router 7** – Navegación SPA
- **TanStack Query** – Gestión de estado server-side
- **React Hook Form + Zod** – Validación de formularios
- **Sonner** – Notificaciones toast

### Backend
- **Node.js 20** – Runtime JavaScript
- **Express 5** – Framework web
- **Prisma ORM** – Mapeo objeto-relacional
- **SQLite** – Base de datos embebida
- **JWT** – Autenticación stateless
- **Zod** – Validación de schemas
- **Helmet + CORS + Rate Limit** – Seguridad

### Inteligencia Artificial
- **Google Gemini API** – Generación de mezclas asistida
- **LLMStudio** – Alternativa local (100% privada)
- **Integración multi-proveedor** – Intercambiable vía config

### Herramientas y Testing
- **Jest** – Testing unitario y de integración
- **React Testing Library** – Testing de componentes
- **ESLint + Prettier** – Linting y formateo
- **Git** – Control de versiones

---
## 🗃️ Modelo de dominio

La entidad principal es `Paint`.

Las mezclas **son pinturas**, diferenciadas por el campo `isMix`.

Las recetas y metadatos de IA se almacenan como JSON.

---

## 🧠 Integración con IA

La IA se utiliza como asistente para proponer mezclas:

- ✅ Produce respuestas estructuradas en JSON
- ✅ Usa exclusivamente la paleta del usuario
- ✅ Soporta referencias del fabricante (ej: Vallejo 70.830) para mayor precisión
- ✅ El usuario revisa y confirma siempre
- ✅ Las mezclas generadas se guardan automáticamente en la libreta

**Proveedores soportados:**
- **Gemini** (Google) - Cloud, requiere API key
- **LLMStudio** (Local) - Sin costos, 100% privado, funciona offline

El proveedor es intercambiable mediante variable de entorno `AI_PROVIDER`.

---

## 🔐 Autenticación

- Registro / login por email y contraseña
- Autenticación basada en JWT
- Aislamiento total de datos por usuario

---

## 📦 Importación / Exportación

- JSON como formato canónico
- Exportación completa de la libreta
- Compatible con futuras versiones mediante `schema_version`
## 📁 Estructura del Proyecto

```
TFM/
├── backend/                      # API REST Node.js
│   ├── src/
│   │   ├── config/              # Configuración (DB, env)
│   │   ├── controllers/         # Controladores (Auth, Paints, Mixes)
│   │   ├── middleware/           # Middleware (Auth, CORS, Security, Rate Limit)
│   │   ├── routes/              # Definición de rutas
│   │   ├── schemas/             # Validación Zod
│   │   ├── services/            # Lógica de negocio + Integración IA
│   │   │   └── ai/              # Proveedores de IA (Gemini, LLMStudio)
│   │   └── server.js            # Entry point
│   ├── prisma/
│   │   ├── schema.prisma        # Definición de entidades
│   │   └── migrations/          # Migraciones de base de datos
│   ├── public/                  # Archivos públicos con .htaccess
│   ├── database/                # SQLite database (producción)
│   ├── .env.production          # Template de variables de entorno
│   ├── build.js                 # Script de preparación para deploy
│   └── package.json
│
├── frontend/                     # SPA React
│   ├── src/
│   │   ├── components/          # Componentes UI
│   │   │   ├── auth/            # Login, Register, ProtectedRoute
│   │   │   ├── layout/          # Layout, Header, Navigation
│   │   │   ├── mixes/           # MixForm, RecipePreview, RecipeEditor
│   │   │   ├── paints/          # PaintCard, PaintFilters, PaintForm
│   │   │   └── ui/              # Button, Input, Card, Logo
│   │   ├── context/             # AuthContext
│   │   ├── hooks/               # Custom hooks (usePaints, useMixes, useAuth)
│   │   ├── lib/                 # Configuración (api, utils)
│   │   ├── pages/               # Páginas (Login, Paints, Mixes, ImportExport)
│   │   ├── services/            # Llamadas a API
│   │   └── router.jsx           # Configuración de rutas
│   ├── .env.production          # Configuración de build
│   └── package.json
│
│
├── ADRs/                        # Architecture Decision Records
│   ├── ADR-001.md               # Arquitectura general
│   ├── ADR-002.md               # Base de datos SQLite
│   ├── ADR-003.md               # Modelo de dominio
│   ├── ADR-004.md               # API REST
│   ├── ADR-005.md               # Integración IA
│   └── ...                      # Decisiones adicionales
│
├── DEPLOYMENT/                  # Guías y scripts de despliegue
│   ├── DEPLOYMENT_GUIDE.md      # Guía paso a paso para cPanel
│   ├── CHECKLIST.md             # Lista de verificación
│   ├── GENERIC_DEPLOYMENT.md    # Despliegues en otras infraestructuras
│   ├── backup.sh                # Script de backup automático
│   └── public_html/             # Templates de .htaccess
│
├── AGENTS.md                    # Guías para desarrolladores
└── README.md                    # Documentación principal
```

---

## ⚙️ Instalación y Ejecución

### Requisitos Previos

- **Node.js** >= 18.0.0 (recomendado 20.20.0)
- **npm** >= 8.0.0
- **Git**

### 1. Clonar Repositorio

```bash
git clone https://github.com/aviejo/libretapinturas.git
cd libretapinturas
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# - Editar .env con tus valores:
# - NODE_ENV=development   production
# - PORT=3000
# - DATABASE_URL="file:./dev.db"
# - JWT_SECRET (generar clave segura)
# - AI_API_KEY (opcional, para funcionalidad IA)
# - AI_PROVIDER=gemini
# - AI_URL=http://ia/api
# - AI_MODEL=gemini-2.5-flash

# Crear base de datos y ejecutar migraciones
mkdir -p database
npx prisma migrate dev

# Iniciar servidor de desarrollo
npm run dev
```

El backend estará disponible en: http://localhost:3000

### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar API URL (para desarrollo local, backend en :3000)
cp .env.example .env.development
# - "VITE_API_URL=http://localhost:3000/api"
# App Configuration
# - VITE_APP_NAME=Libreta de Pinturas
# - VITE_APP_VERSION=1.0.0

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en: http://localhost:5173

### 4. Ejecutar Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

---

## 🚀 Despliegue en Producción (cPanel)

### Build del Frontend

```bash
cd frontend
npm run build
# Genera carpeta dist/ con archivos estáticos
```

### Preparar Backend

```bash
cd backend
node build.js
# Genera carpeta build/ lista para subir
# Editar build/.env con variables de producción
```

### Estructura en Hosting Compartido y Cpanel

```
app.tupintacomoquieras.com/
├── index.html                  # Frontend (build de dist/)
├── assets/                     # Assets compilados
├── .htaccess                   # Rewrite rules
└── api/                        # Backend Node.js
    ├── src/
    ├── prisma/
    ├── public/
    ├── database/               # SQLite
    ├── .env                    # Variables de producción
    └── package.json
```

### Pasos en cPanel

1. Subir frontend a raíz del dominio
2. Subir backend a carpeta `/api/`
3. Configurar Node.js App en cPanel:
   - Application root: `app.tupintacomoquieras.com/api`
   - Startup file: `src/server.js`
   - Node.js version: 20.20.0
4. Configurar variables de entorno en cPanel
5. Ejecutar: `npx prisma migrate deploy`
6. Iniciar aplicación

Ver guía completa: [DEPLOYMENT/DEPLOYMENT_GUIDE.md](DEPLOYMENT/DEPLOYMENT_GUIDE.md)

---

## 🎯 Funcionalidades Principales

### 1. Gestión de Pinturas
- **CRUD completo:** Crear, leer, actualizar y eliminar pinturas
- **Filtros avanzados:** Buscar por marca, nombre, referencia, stock
- **Doble categoría:** Pinturas comerciales vs. Mezclas personalizadas
- **Referencias:** Soporte para códigos de referencia de fabricantes

### 2. Generador de Mezclas con IA
- **Descripción natural:** Describir el color deseado en lenguaje natural
- **Referencia de fabricante:** Soporte para códigos como Vallejo 70.830
- **Paleta personalizada:** La IA usa solo las pinturas del usuario
- **Validación manual:** El usuario revisa y confirma la receta antes de guardar
- **Edición de recetas:** Modificar proporciones y componentes

### 3. Importación / Exportación
- **Formato JSON canónico:** Estructura estandarizada con schema_version
- **Backup completo:** Exportar toda la libreta con metadatos
- **Importación inteligente:** Omite duplicados automáticamente
- **Portabilidad:** Compatible entre usuarios

### 4. Autenticación Multiusuario
- **Registro/Login:** Email y contraseña con validación
- **JWT seguro:** Tokens stateless con expiración
- **Aislamiento:** Datos completamente separados por usuario
- **Protección de rutas:** Middleware de autenticación

### 5. Diseño Responsive
- **Desktop:** Menú horizontal completo
- **Móvil:** Menú hamburger con panel deslizante
- **Adaptativo:** Breakpoints optimizados para todas las pantallas

---

## 🧪 Testing

### Cobertura de Tests

- **81 tests** pasando
- **Cobertura:** Backend y Frontend
- **Tipos:** Unitarios, de integración, de componentes

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests específicos
npm test -- PaintCard.test.jsx
npm test -- --watch

# Con cobertura
npm run test:coverage
```


## 🛠️ Características Técnicas Destacadas

### Arquitectura
- **Separación de responsabilidades:** Backend API + Frontend SPA
- **RESTful API:** Endpoints semánticos con métodos HTTP correctos
- **ORM Prisma:** Tipado fuerte y migraciones de base de datos
- **JWT Auth:** Stateless y escalable

### Integración IA
- **Multi-proveedor:** Gemini API (cloud) + LLMStudio (local)
- **Prompt engineering:** Prompts optimizados para respuestas JSON estructuradas
- **Fuzzy matching:** Corrección automática de IDs de pinturas
- **Caching:** Instancia única del proveedor de IA

### Seguridad
- **Helmet:** Headers de seguridad HTTP
- **CORS:** Orígenes configurables
- **Rate limiting:** Protección contra abuso (10 req/hora para IA)
- **Validación:** Zod en frontend y backend
- **Protección BD:** .htaccess denegando acceso a SQLite

### UX/UI
- **Diseño atómico:** Componentes reutilizables
- **TailwindCSS:** Estilos utility-first
- **Loading states:** Spinners y feedback visual
- **Toast notifications:** Errores y éxitos con Sonner
- **Form validation:** Feedback en tiempo real

---

## 🎓 Aprendizajes y Decisiones

Ver documentación detallada en carpeta `/ADRs/`:

- **ADR-001:** Arquitectura React SPA + Node.js API
- **ADR-002:** SQLite para simplicidad y portabilidad
- **ADR-003:** Modelo unificado Paint (mezclas son pinturas)
- **ADR-004:** API REST con JSON estructurado
- **ADR-005:** Integración IA multi-proveedor
- **ADR-006:** Import/Export con schema_version
- **ADR-007:** Autenticación JWT
- **ADR-008:** UX principles y diseño responsive
- **ADR-009:** Despliegue en hosting compartido (cPanel)
- **ADR-010:** Testing strategy (Jest + Supertest)
- **ADR-011:** State management (TanStack Query + Context)
- **ADR-012:** Validación y error handling (Zod + Sonner)
- **ADR-013:** Seguridad y configuración de entorno

---

## 🚀 Evolución Futura

- Compartición pública de mezclas entre usuarios
- Etiquetas y categorías personalizadas
- Historial de modificaciones (audit log)
- Análisis de color avanzado (cámara + picker)
- Migración a PostgreSQL si escala el uso
- App móvil nativa (React Native)

---


