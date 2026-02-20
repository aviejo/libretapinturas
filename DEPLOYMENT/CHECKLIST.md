# ============================================
# CHECKLIST RÁPIDO DE DESPLIEGUE
# Libreta de Pinturas - FASE 12
# ============================================

## ✅ Pre-Despliegue (Local)

### Configuración
- [ ] Editar `backend/.env.production` con JWT_SECRET real
- [ ] Editar `backend/.env.production` con AI_API_KEY de Gemini
- [ ] Verificar que `frontend/.env.production` tiene VITE_API_URL=/api

### Build
- [ ] Ejecutar: cd frontend && npm install
- [ ] Ejecutar: cd frontend && npm run build
- [ ] Verificar que existe carpeta `frontend/dist/`
- [ ] Verificar que `backend/database/` existe o crearla

---

## ✅ Despliegue en cPanel

### Subir Archivos
- [ ] Subir contenido de `frontend/dist/` a `app.tupintacomoquieras.com/`
- [ ] Subir `.htaccess` a raíz del dominio
- [ ] Crear carpeta `api/` y subir todo el backend
- [ ] Renombrar `backend/.env.production` a `api/.env`
- [ ] Subir `.htaccess` a `api/public/`

### Configurar Node.js App
- [ ] Application root: `app.tupintacomoquieras.com/api`
- [ ] Application URL: `app.tupintacomoquieras.com/api`
- [ ] Application startup file: `src/server.js`
- [ ] Node.js version: `20.20.0`
- [ ] Environment: `Production`

### Instalar Dependencias
- [ ] Click en "Run NPM Install"
- [ ] Esperar a que termine sin errores

### Configurar Variables de Entorno
- [ ] NODE_ENV=production
- [ ] PORT=3000
- [ ] DATABASE_URL=file:./database/libreta.db
- [ ] JWT_SECRET=<tu-clave-32-caracteres>
- [ ] AI_PROVIDER=gemini
- [ ] AI_API_KEY=<tu-api-key>
- [ ] AI_URL=https://generativelanguage.googleapis.com/v1beta
- [ ] AI_MODEL=gemini-2.5-flash
- [ ] CORS_ORIGIN=https://app.tupintacomoquieras.com
- [ ] LOG_LEVEL=info

### Base de Datos
- [ ] Crear carpeta `api/database/` (si no existe)
- [ ] Establecer permisos 755 en carpeta database
- [ ] Ejecutar: npx prisma migrate deploy
- [ ] Verificar que se creó `api/database/libreta.db`

### Iniciar Aplicación
- [ ] Click en "START APP"
- [ ] Verificar que status muestra "Running"

---

## ✅ Verificación Post-Despliegue

### API Check
- [ ] https://app.tupintacomoquieras.com/api/health responde OK

### Frontend
- [ ] https://app.tupintacomoquieras.com/ carga sin errores
- [ ] No hay errores 404 en consola del navegador

### Funcionalidad
- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Crear pintura comercial funciona
- [ ] Generar mezcla con IA funciona
- [ ] Guardar mezcla funciona
- [ ] Exportar libreta funciona (descarga JSON)
- [ ] Ver lista de pinturas funciona

### Seguridad
- [ ] No se puede acceder a `api/database/libreta.db` vía web
- [ ] No se puede ver el contenido de `api/.env`
- [ ] HTTPS funciona correctamente

---

## 🎉 Si todo está ✓, ¡tu aplicación está lista!

**URL:** https://app.tupintacomoquieras.com

---

## 🆘 Si algo falla:

1. Revisar logs de Passenger en cPanel
2. Verificar que todas las variables de entorno están configuradas
3. Confirmar que las migraciones de Prisma se ejecutaron
4. Revisar permisos de archivos y carpetas

**Ver guía completa:** `DEPLOYMENT/DEPLOYMENT_GUIDE.md`
