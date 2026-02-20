# ============================================
# 📘 GUÍA DE DESPLIEGUE EN CPANEL COMPARTIDO
# Libreta de Pinturas - FASE 12
# ============================================

## 🎯 Resumen de Arquitectura

```
Dominio: https://app.tupintacomoquieras.com
├── / (raíz)              → Frontend (React build estático)
└── /api/                 → Backend (Node.js + Express + Passenger)
```

- **Frontend:** Archivos estáticos (HTML, CSS, JS) servidos por Apache
- **Backend:** Aplicación Node.js corriendo con Passenger en subdirectorio `/api`
- **Base de datos:** SQLite ubicada en `api/database/libreta.db`

---

## 📋 Pre-requisitos

Antes de empezar, asegúrate de tener:

- [ ] Acceso a cPanel de tu hosting
- [ ] Node.js disponible en tu hosting (versión 18+, preferiblemente 20.20.0)
- [ ] API Key de Gemini lista para producción
- [ ] JWT Secret generado (mínimo 32 caracteres)
- [ ] Acceso FTP o File Manager para subir archivos

---

## 🔧 FASE 1: Preparación Local

### Paso 1.1: Configurar Variables de Entorno

**Backend - Editar `backend/.env.production`:**

```bash
# Abrir backend/.env.production y completar:
JWT_SECRET=tu-clave-secreta-larga-aqui-minimo-32-caracteres
AI_API_KEY=tu-api-key-de-gemini-aqui
```

**Generar JWT_SECRET (si no lo tienes):**
```bash
# Opción A: Usar OpenSSL
openssl rand -base64 64

# Opción B: Usar Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Paso 1.2: Construir el Frontend

```bash
# Desde la raíz del proyecto
cd frontend

# Instalar dependencias (si no están instaladas)
npm install

# Crear build de producción
npm run build
```

Esto creará una carpeta `frontend/dist/` con los archivos estáticos.

### Paso 1.3: Preparar Backend para Producción

```bash
# Desde la raíz del proyecto
cd backend

# Instalar dependencias
npm install

# Crear directorio de base de datos
mkdir -p database

# Verificar que todo está correcto
npm test
```

---

## 📦 FASE 2: Subir Archivos al Hosting

### Estructura de Carpetas en cPanel

En tu hosting, debes tener esta estructura:

```
/home/tupintac/
├── app.tupintacomoquieras.com/          # ← Raíz del dominio (frontend)
│   ├── index.html
│   ├── assets/
│   ├── .htaccess
│   └── api/                             # ← Backend (Node.js)
│       ├── package.json
│       ├── src/
│       ├── prisma/
│       ├── database/
│       └── .env                         # ← Variables de entorno
└── backups/                             # ← Backups de base de datos (opcional)
```

### Paso 2.1: Subir Frontend

1. Abre **File Manager** en cPanel
2. Navega a: `app.tupintacomoquieras.com/`
3. Elimina archivos existentes (si es necesario)
4. Sube el contenido de `frontend/dist/` a esta carpeta:
   - `index.html`
   - `assets/` (con todos los archivos JS, CSS)
   - `.htaccess` (del directorio DEPLOYMENT/public_html/)

### Paso 2.2: Crear y Subir Backend

**En File Manager de cPanel:**

1. Crea el subdirectorio: `api/` (dentro de app.tupintacomoquieras.com/)

2. **Solo estos archivos son necesarios del backend:**

   ```
   api/
   ├── package.json              ← Archivo principal de dependencias
   ├── package-lock.json         ← Versiones exactas de dependencias
   ├── src/                      ← Todo el código fuente
   │   ├── server.js
   │   ├── config/
   │   ├── controllers/
   │   ├── middleware/
   │   ├── routes/
   │   ├── schemas/
   │   └── services/
   ├── prisma/                   ← Configuración de base de datos
   │   ├── schema.prisma
   │   └── migrations/
   │       └── (todos los archivos de migraciones)
   ├── public/                   ← Archivos públicos del backend
   │   └── .htaccess            ← Para proteger la base de datos
   ├── database/                ← Crear carpeta vacía (aquí irá la BD SQLite)
   └── .env                     ← Variables de entorno (tú lo editas y subes)
   ```

3. **NO subir estos archivos/carpetas:**
   - ❌ `node_modules/` (muy grande, se instala automáticamente con npm install)
   - ❌ `.env.example`, `.env.development`, `.env.production` (no se usan en prod)
   - ❌ `coverage/` (carpeta de tests, no necesaria)
   - ❌ `test.db`, `dev.db` (bases de datos locales)
   - ❌ `jest.config.js` (solo para tests)
   - ❌ `check_mixes.js` (script de utilidad, no necesario)
   - ❌ Archivos de log: `backend.log`, etc.

4. **Sobre el archivo `.env`:**
   - Toma `backend/.env.production` como base
   - Edítalo con tus valores reales (JWT_SECRET, AI_API_KEY)
   - Renómbralo a `.env` (sin "production")
   - Súbelo a `api/.env`

**Archivos mínimos requeridos (resumen):**
- package.json
- package-lock.json  
- src/ (todo el directorio)
- prisma/ (todo el directorio)
- public/.htaccess
- database/ (carpeta vacía)
- .env (que editas tú)

**Opción práctica:**
Si prefieres no subir archivos uno por uno, puedes:
1. Comprimir (zip) solo las carpetas necesarias
2. Subir el zip a cPanel
3. Descomprimir en File Manager

---

## ⚙️ FASE 3: Configurar Node.js en cPanel

### Paso 3.1: Configurar Aplicación Node.js

1. En cPanel, busca y abre: **"Setup Node.js App"** (o similar)
2. Configura así:
   
   | Campo | Valor |
   |-------|-------|
   | **Application root** | `app.tupintacomoquieras.com/api` |
   | **Application URL** | `app.tupintacomoquieras.com/api` |
   | **Application startup file** | `src/server.js` |
   | **Node.js version** | `20.20.0` (o la más alta disponible ≥18) |
   | **Environment** | `Production` |

3. Guarda la configuración

### Paso 3.2: Instalar Dependencias

En la misma pantalla de configuración Node.js:

1. Busca el botón: **"Run NPM Install"**
2. Haz clic para instalar todas las dependencias
3. Espera a que termine (puede tardar varios minutos)

**Alternativa vía SSH (si tienes acceso):**
```bash
cd /home/tupintac/app.tupintacomoquieras.com/api
npm install
```

### Paso 3.3: Configurar Variables de Entorno

En la pantalla de configuración Node.js, busca **"Environment Variables"**:

1. Haz clic en **"Add Variable"** para cada una:

   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=file:./database/libreta.db
   JWT_SECRET=tu-clave-secreta-aqui
   AI_PROVIDER=gemini
   AI_API_KEY=tu-api-key-de-gemini
   AI_URL=https://generativelanguage.googleapis.com/v1beta
   AI_MODEL=gemini-2.5-flash
   CORS_ORIGIN=https://app.tupintacomoquieras.com
   LOG_LEVEL=info
   ```

2. Guarda cada variable

---

## 🗄️ FASE 4: Configurar Base de Datos

### Paso 4.1: Crear Directorio de Base de Datos

1. En File Manager, verifica que existe: `api/database/`
2. Establece permisos 755 para la carpeta:
   - Click derecho → Change Permissions
   - Numeric: 755
   - Aplicar a directorios y archivos dentro

### Paso 4.2: Ejecutar Migraciones de Prisma

En cPanel Node.js configuration:

1. Busca la opción: **"Run JS Script"** o **"NPM Scripts"**
2. Ejecuta el comando:
   ```
   npx prisma migrate deploy
   ```
   
   O si hay un botón de "Run NPM Script":
   - Selecciona `prisma` y `migrate deploy`

**Alternativa vía SSH:**
```bash
cd /home/tupintac/app.tupintacomoquieras.com/api
npx prisma migrate deploy
```

### Paso 4.3: Verificar Base de Datos

1. Revisa que se creó el archivo: `api/database/libreta.db`
2. El archivo debe tener permisos de lectura/escritura

---

## 🚀 FASE 5: Iniciar la Aplicación

### Paso 5.1: Iniciar Backend

En cPanel Node.js configuration:

1. Busca el botón: **"START APP"** o **"START"**
2. Haz clic para iniciar la aplicación
3. Espera unos segundos y verifica el estado

Debería mostrar: **"App Status: Running"**

### Paso 5.2: Verificar Logs (si hay errores)

Si la aplicación no inicia:

1. En cPanel Node.js, busca: **"View Logs"** o **"Passenger Log"**
2. Revisa los errores más recientes
3. Los errores comunes:
   - Permisos de base de datos
   - Variables de entorno faltantes
   - Node modules faltantes

---

## ✅ FASE 6: Verificación Post-Despliegue

### Checklist de Verificación

Abre tu navegador y verifica cada punto:

#### 1. Health Check del Backend
```
https://app.tupintacomoquieras.com/api/health
```
✅ Debe responder: `{"status": "ok", ...}`

#### 2. Frontend Carga Correctamente
```
https://app.tupintacomoquieras.com/
```
✅ Debe mostrar la página de login/registro

#### 3. Registro de Usuario
- Crear cuenta nueva
- Verificar que guarda en base de datos
- Revisar que no hay errores CORS

#### 4. Login
- Iniciar sesión con usuario creado
- Verificar que el JWT funciona

#### 5. Crear Pintura Comercial
- Ir a "Mis Pinturas"
- Agregar pintura de prueba (ej: Vallejo, German Grey, #808080)
- Verificar que aparece en la lista

#### 6. Generar Mezcla con IA
- Ir a "Mezclas" → "Generar con IA"
- Completar formulario:
  - Marca: "Custom"
  - Nombre: "Test Mix"
  - Descripción: "Gris oscuro"
- Enviar y verificar que genera receta
- Guardar mezcla y verificar que aparece en lista

#### 7. Import/Export
- Exportar libreta (debe descargar JSON)
- Verificar que el archivo tiene contenido válido
- (Opcional) Probar importar si tienes archivo válido

#### 8. Editar Pintura
- Editar una pintura existente
- Cambiar color o notas
- Verificar que guarda cambios

---

## 🛠️ Solución de Problemas Comunes

### Problema 1: "Cannot find module"
**Solución:** Reinstalar dependencias
```bash
cd /home/tupintac/app.tupintacomoquieras.com/api
rm -rf node_modules package-lock.json
npm install
```

### Problema 2: "Database is locked" o permisos
**Solución:** Verificar permisos de carpeta database
```bash
chmod 755 /home/tupintac/app.tupintacomoquieras.com/api/database
chmod 644 /home/tupintac/app.tupintacomoquieras.com/api/database/libreta.db
```

### Problema 3: CORS errors en frontend
**Solución:** Verificar que CORS_ORIGIN está configurado correctamente en variables de entorno

### Problema 4: Backend no inicia
**Revisar:**
1. ¿Están todas las variables de entorno configuradas?
2. ¿Se ejecutaron las migraciones de Prisma?
3. ¿Hay errores en los logs de Passenger?
4. ¿La versión de Node.js es compatible (≥18)?

### Problema 5: Frontend muestra "404" o página en blanco
**Solución:** Verificar que .htaccess está en la raíz y contiene las reglas de rewrite

---

## 📊 Mantenimiento

### Backups Automáticos

El script `backup.sh` crea backups de la base de datos:

```bash
# Ejecutar manualmente
/home/tupintac/backups/backup.sh

# Configurar cron job en cPanel para backups automáticos:
# Ir a "Cron Jobs" en cPanel
# Añadir cada día a las 3am:
0 3 * * * /home/tupintac/backups/backup.sh >> /home/tupintac/backups/backup.log 2>&1
```

### Actualizar Aplicación

Para actualizar a una nueva versión:

1. **Backup:** Ejecutar backup.sh primero
2. **Descargar cambios:** Sustituir archivos actualizados
3. **Reinstalar dependencias:** Run NPM Install
4. **Reiniciar:** Restart App en cPanel

---

## 📞 Checklist Final de Despliegue

Antes de dar por terminado, verifica:

- [ ] Frontend carga en `https://app.tupintacomoquieras.com/`
- [ ] Backend responde en `https://app.tupintacomoquieras.com/api/health`
- [ ] Variables de entorno configuradas en cPanel
- [ ] Base de datos SQLite creada y migraciones ejecutadas
- [ ] JWT_SECRET es segura (≥32 caracteres)
- [ ] AI_API_KEY de Gemini configurada
- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Crear pintura funciona
- [ ] Generar mezcla con IA funciona
- [ ] Import/Export funciona
- [ ] Script de backup configurado (opcional)

---

## 🎉 ¡Felicidades!

Si completaste todos los pasos, tu **Libreta de Pinturas** está desplegada y funcionando en producción.

**URL de acceso:** https://app.tupintacomoquieras.com

---

## 📚 Recursos Adicionales

- **Repositorio:** [Tu repo de GitHub]
- **Documentación API:** Ver endpoints disponibles en `src/routes/`
- **Logs:** Disponibles en cPanel → Node.js App → View Logs

---

**¿Problemas?** Revisa:
1. Logs de Passenger en cPanel
2. Logs de la aplicación
3. Permisos de archivos y carpetas
4. Variables de entorno configuradas

**¿Todo funciona?** ¡Disfruta de tu Libreta de Pinturas en producción! 🎨
