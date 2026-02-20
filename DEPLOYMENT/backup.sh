#!/bin/bash
# ============================================
# Backup Script for SQLite Database
# Libreta de Pinturas - cPanel Deployment
# ============================================

# Configuration
BACKUP_DIR="/home/tupintac/backups"
DB_PATH="/home/tupintac/app.tupintacomoquieras.com/api/database/libreta.db"
DATE=$(date +%Y%m%d_%H%M%S)
HOSTNAME=$(hostname)
KEEP_BACKUPS=7

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# Functions
# ============================================
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================
# Main Script
# ============================================

echo ""
echo "========================================"
echo "📦 DATABASE BACKUP - Libreta de Pinturas"
echo "========================================"
echo ""

# Check if backup directory exists, create if not
if [ ! -d "$BACKUP_DIR" ]; then
    log_info "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
    if [ $? -ne 0 ]; then
        log_error "Failed to create backup directory!"
        exit 1
    fi
fi

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    log_error "Database not found at: $DB_PATH"
    exit 1
fi

# Get database size
DB_SIZE=$(du -h "$DB_PATH" | cut -f1)
log_info "Database size: $DB_SIZE"

# Create backup filename
BACKUP_FILE="libreta_backup_${DATE}.db"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"

# Create backup
log_info "Creating backup: $BACKUP_FILE"
cp "$DB_PATH" "$BACKUP_PATH"

if [ $? -eq 0 ]; then
    log_info "✅ Backup created successfully!"
    log_info "📁 Location: $BACKUP_PATH"
    
    # Compress backup
    gzip "$BACKUP_PATH"
    COMPRESSED_SIZE=$(du -h "${BACKUP_PATH}.gz" | cut -f1)
    log_info "🗜️  Compressed size: $COMPRESSED_SIZE"
    
    # Clean old backups (keep only last N)
    log_info "🧹 Cleaning old backups (keeping last $KEEP_BACKUPS)..."
    
    # List all backup files, sort by date (newest first), skip first N, delete the rest
    ls -t "$BACKUP_DIR"/libreta_backup_*.db.gz 2>/dev/null | tail -n +$((KEEP_BACKUPS + 1)) | while read -r old_backup; do
        log_warn "Removing old backup: $(basename "$old_backup")"
        rm -f "$old_backup"
    done
    
    # Count remaining backups
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/libreta_backup_*.db.gz 2>/dev/null | wc -l)
    log_info "📊 Total backups in storage: $BACKUP_COUNT"
    
    echo ""
    echo "========================================"
    log_info "✨ Backup completed successfully!"
    echo "========================================"
    echo ""
    exit 0
else
    log_error "❌ Backup failed!"
    exit 1
fi
