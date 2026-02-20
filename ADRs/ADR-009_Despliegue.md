# ADR-009: Estrategia de Despliegue

## Contexto

Se busca un despliegue:
- Barato y accesible
- Sencillo de mantener
- Adecuado para una aplicación Node.js + SQLite
- Con backups automáticos de la base de datos

## Decisión

Se adopta un despliegue en **hosting compartido con soporte Node.js** (ifastnet u similar) con gestión de procesos mediante **PM2**.

## Infraestructura

### Frontend
- **Tecnología**: React SPA (build estático)
- **Despliegue**: Hosting compartido (cPanel)
- **Método**: Build local → Upload vía FTP/cPanel File Manager
- **Ruta**: `/public_html/` o subdirectorio

### Backend
- **Tecnología**: Node.js
- **Despliegue**: Hosting compartido con soporte Node.js
- **Gestión de procesos**: PM2
- **Puerto**: Puerto asignado por el host (ej: 3000, 8080)
- **Ruta**: `/home/user/backend/`

### Base de Datos
- **Motor**: SQLite
- **Ubicación**: `/home/user/backend/data/dev.db`
- **Backups**: Automáticos diarios + manuales

## Configuración PM2

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'paint-api',
    script: './server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

## Estructura de Carpetas en Servidor

```
/home/user/
├── public_html/           # Frontend (React build)
│   ├── index.html
│   └── assets/
├── backend/              # Backend Node.js
│   ├── server.js
│   ├── package.json
│   ├── ecosystem.config.js
│   ├── prisma/
│   ├── logs/            # Logs de PM2
│   └── data/            # SQLite database
│       └── dev.db
└── backups/             # Backups automáticos
    └── db/
```

## Variables de Entorno

### .env.production (backend)
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL="file:./data/dev.db"
JWT_SECRET=your-production-secret-key
AI_API_KEY=your-gemini-key
AI_PROVIDER=gemini
CORS_ORIGIN=https://tudominio.com
```

### .env.production (frontend - build time)
```bash
VITE_API_URL=https://tudominio.com:3000/api
```

## Proceso de Despliegue

### Backend
1. Subir código vía FTP/Git
2. Instalar dependencias: `npm install --production`
3. Generar Prisma client: `npx prisma generate`
4. Ejecutar migraciones: `npx prisma migrate deploy`
5. Iniciar con PM2: `pm2 start ecosystem.config.js`
6. Guardar configuración: `pm2 save`
7. Configurar inicio automático: `pm2 startup`

### Frontend
1. Build local: `npm run build`
2. Subir carpeta `dist/` a `public_html/`

## Backups de SQLite

### Estrategia
- **Backup diario automático**: Script cron que copia la DB
- **Backup manual**: Antes de despliegues importantes
- **Retención**: 30 días de backups

### Script de Backup
```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/home/user/backups/db"
DB_FILE="/home/user/backend/data/dev.db"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp $DB_FILE "$BACKUP_DIR/dev_$DATE.db"

# Eliminar backups antiguos (>30 días)
find $BACKUP_DIR -name "dev_*.db" -mtime +30 -delete
```

### Configuración Cron
```
0 2 * * * /home/user/backend/scripts/backup.sh
```

## Configuración cPanel

### Node.js App Setup
1. Acceder a "Setup Node.js App" en cPanel
2. Seleccionar versión de Node.js (18.x o superior)
3. Especificar:
   - Application root: `/home/user/backend`
   - Application URL: Dominio o subdominio
   - Application startup file: `server.js`
4. Instalar paquetes npm

### Proxy Inverso (si aplica)
Si el hosting no permite puertos directos:
- Configurar Apache/Nginx como proxy reverso
- Redirigir `/api/*` al puerto del backend

## Justificación

- **Coste mínimo**: Hosting compartido (~$3-10/mes)
- **Simplicidad**: Sin configuración compleja de servidor
- **Mantenible**: PM2 gestiona reinicios automáticos
- **Backups**: Estrategia simple pero efectiva
- **Portabilidad**: Fácil migración a otro host

## Consecuencias

### Positivas
- Despliegue rápido y económico
- No requiere conocimientos avanzados de sysadmin
- PM2 asegura uptime del backend
- Backups automáticos protegen los datos

### Negativas
- Escalabilidad limitada (hosting compartido)
- No ideal para alta concurrencia
- SQLite no soporta múltiples escritores simultáneos
- Dependencia del proveedor de hosting

## Plan de Evolución Futura

Si el tráfico crece significativamente:
1. Migrar a VPS propio (DigitalOcean, Linode, AWS Lightsail)
2. Considerar PostgreSQL para mejor concurrencia
3. Implementar CDN para assets estáticos
4. Configurar CI/CD con GitHub Actions
