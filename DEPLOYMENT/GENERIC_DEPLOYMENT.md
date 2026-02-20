# Guía de Despliegue Genérica

Esta guía proporciona instrucciones de despliegue independientes de la infraestructura específica. Puede aplicarse a VPS, contenedores Docker, servicios cloud (Heroku, Railway, DigitalOcean), o cualquier plataforma que soporte Node.js.

## Requisitos Generales

### Software Necesario
- **Node.js**: Versión 18.x o superior (20.x recomendado)
- **npm**: 8.x o superior
- **Git**: Para clonar el repositorio
- **Base de Datos**: SQLite (incluida, no requiere instalación adicional)

### Recursos Mínimos Recomendados
- **RAM**: 512 MB (1 GB recomendado para producción)
- **Almacenamiento**: 1 GB libre
- **Ancho de banda**: Dependiente del tráfico esperado
- **Puertos**: 1 puerto disponible (3000 por defecto)

## Opciones de Despliegue

### Opción 1: Servidor VPS (Ubuntu/Debian/CentOS)

#### 1. Preparar el Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20.x (ejemplo en Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version  # Debe mostrar v20.x.x
npm --version   # Debe mostrar 10.x.x

# Instalar PM2 (gestor de procesos)
sudo npm install -g pm2
```

#### 2. Clonar y Configurar

```bash
# Crear directorio para la aplicación
mkdir -p /var/www

# Clonar repositorio (o subir archivos vía SCP/FTP)
git clone https://github.com/aviejo/libretapinturas.git /var/www/libreta-pinturas
cd /var/www/libretapinturas

# Instalar dependencias del backend
cd backend
npm install --production

# Crear directorio de base de datos
mkdir -p database

# Configurar variables de entorno
cp .env.production .env
# Editar .env con nano o vim:
nano .env
```

#### 3. Variables de Entorno Requeridas

Editar el archivo `.env`:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=file:./database/libreta.db
JWT_SECRET=tu-clave-secreta-minimo-32-caracteres
AI_PROVIDER=gemini
AI_API_KEY=tu-api-key-de-gemini
AI_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
AI_MODEL=gemini-pro
CORS_ORIGIN=http://tu-dominio-o-ip
LOG_LEVEL=info
```

**Nota sobre CORS_ORIGIN**: 
- Si frontend y backend están en el mismo dominio: `https://tudominio.com`
- Si están separados: `https://frontend-url.com`
- Para desarrollo/pruebas: `*`

#### 4. Base de Datos

```bash
# Ejecutar migraciones de Prisma
npx prisma migrate deploy

# Verificar que se creó la base de datos
ls -la database/
```

#### 5. Configurar PM2

Crear archivo `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'libreta-pinturas-api',
    script: './src/server.js',
    cwd: '/var/www/libretapinturas/backend',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '500M',
    restart_delay: 3000,
    max_restarts: 5,
    min_uptime: '10s'
  }]
}
```

Iniciar con PM2:

```bash
# Crear directorio de logs
mkdir -p logs

# Iniciar aplicación
pm2 start ecosystem.config.js

# Guardar configuración para inicio automático
pm2 save
pm2 startup
# Ejecutar el comando que muestra PM2 startup
```

#### 6. Configurar Nginx (Reverse Proxy)

```bash
# Instalar Nginx
sudo apt install nginx -y

# Crear configuración
sudo nano /etc/nginx/sites-available/libretapinturas
```

Contenido del archivo:

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Aumentar límites para uploads
    client_max_body_size 10M;
}
```

Activar sitio:

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/libretapinturas /etc/nginx/sites-enabled/

# Eliminar default si existe
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

#### 7. SSL con Let's Encrypt (Opcional pero recomendado)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com

# Verificar auto-renovación
sudo certbot renew --dry-run
```

---

### Opción 2: Docker

#### 1. Dockerfile para Backend

Crear `backend/Dockerfile`:

```dockerfile
FROM node:20-alpine

# Instalar dependencias necesarias para SQLite
RUN apk add --no-cache python3 make g++

# Crear directorio de la aplicación
WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Crear directorio para base de datos
RUN mkdir -p database

# Puerto expuesto
EXPOSE 3000

# Comando de inicio
CMD ["node", "src/server.js"]
```

#### 2. Docker Compose (Backend + Posible Frontend)

Crear `docker-compose.yml` en raíz del proyecto:

```yaml
version: '3.8'

services:
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: libreta-api
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=file:./database/libreta.db
      - JWT_SECRET=${JWT_SECRET}
      - AI_PROVIDER=${AI_PROVIDER}
      - AI_API_KEY=${AI_API_KEY}
      - AI_URL=${AI_URL}
      - AI_MODEL=${AI_MODEL}
      - CORS_ORIGIN=${CORS_ORIGIN}
      - LOG_LEVEL=info
    volumes:
      - ./data:/app/database
    networks:
      - libreta-network

  # Opcional: Frontend estático servido por Nginx
  frontend:
    image: nginx:alpine
    container_name: libreta-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./frontend/dist:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - api
    networks:
      - libreta-network

networks:
  libreta-network:
    driver: bridge

volumes:
  database:
```

#### 3. Archivo .env para Docker

Crear `.env` en raíz:

```env
JWT_SECRET=genera-una-clave-segura-de-32-caracteres
AI_PROVIDER=gemini
AI_API_KEY=tu-api-key
AI_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
AI_MODEL=gemini-pro
CORS_ORIGIN=http://localhost
```

#### 4. Comandos Docker

```bash
# Construir e iniciar
docker-compose up -d --build

# Ver logs
docker-compose logs -f api

# Detener
docker-compose down

# Backup de base de datos
docker cp libreta-api:/app/database/libreta.db ./backup-$(date +%Y%m%d).db
```

---

### Opción 3: Plataformas Cloud (Heroku, Railway, Render)

#### Heroku

```bash
# Instalar Heroku CLI
# Login
heroku login

# Crear aplicación
heroku create libreta-pinturas-api

# Configurar variables de entorno
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=tu-clave-secreta
heroku config:set AI_PROVIDER=gemini
heroku config:set AI_API_KEY=tu-api-key
heroku config:set AI_MODEL=gemini-pro
heroku config:set CORS_ORIGIN=https://tu-frontend-url.com

# Añadir buildpack de Node.js
heroku buildpacks:add heroku/nodejs

# Desplegar
git push heroku main
```

**Nota**: Para SQLite en Heroku, usar Heroku Postgres (gratuito) en lugar de SQLite, ya que el filesystem es efímero.

#### Railway / Render

1. Conectar repositorio GitHub
2. Configurar variables de entorno en dashboard
3. Seleccionar directorio `backend/`
4. Deploy automático

---

## Verificación Post-Despliegue

### 1. Health Check

```bash
# Verificar API está respondiendo
curl http://tu-dominio:3000/api/health

# Respuesta esperada:
# {"status": "ok", "timestamp": "..."}
```

### 2. Pruebas de Funcionalidad

1. **Registro de usuario**: POST /api/auth/register
2. **Login**: POST /api/auth/login  
3. **Crear pintura**: POST /api/paints
4. **Listar pinturas**: GET /api/paints
5. **Generar mezcla**: POST /api/mixes/generate

### 3. Logs y Monitoreo

```bash
# Con PM2
pm2 logs libreta-pinturas-api
pm2 monit

# Con Docker
docker-compose logs -f

# Con systemd (si se configuró)
sudo journalctl -u libreta-pinturas -f
```

---

## Problemas Comunes y Soluciones

### Error: "Cannot find module"

```bash
# Limpiar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: "Permission denied" en base de datos

```bash
# Verificar permisos
chmod 755 database/
chmod 644 database/libreta.db
```

### Error: CORS

- Verificar que `CORS_ORIGIN` coincide exactamente con la URL del frontend
- Incluir protocolo (http:// o https://)
- Sin barra final

### Error: IA no responde

- Verificar `AI_API_KEY` es válida
- Comprobar límites de rate en Google AI Studio
- Verificar modelo está disponible (`gemini-pro` vs `gemini-1.5-flash`)

---

## Mantenimiento

### Backup de Base de Datos

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
cp backend/database/libreta.db backups/libreta_backup_$DATE.db
gzip backups/libreta_backup_$DATE.db
# Mantener solo últimos 7 días
find backups/ -name "libreta_backup_*.db.gz" -mtime +7 -delete
```

Agregar a cron:
```bash
0 3 * * * /ruta/al/backup.sh >> /var/log/libreta-backup.log 2>&1
```

### Actualizaciones

```bash
# Pull de cambios
git pull origin main

# Reinstalar dependencias si cambió package.json
npm install

# Ejecutar migraciones si hay cambios en schema
npx prisma migrate deploy

# Reiniciar aplicación
pm2 restart libreta-pinturas-api
```

---

## Recursos Adicionales

- **Prisma Migrations**: https://www.prisma.io/docs/concepts/components/prisma-migrate
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/usage/quick-start/
- **Nginx Reverse Proxy**: https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/
- **Let's Encrypt**: https://certbot.eff.org/

---

**Nota**: Esta guía es independiente de proveedores específicos. Para instrucciones detalladas de cPanel, ver `DEPLOYMENT_GUIDE.md`.
