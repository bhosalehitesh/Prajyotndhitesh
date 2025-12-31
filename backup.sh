#!/bin/bash
# Backup script for production data

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_BACKUP="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
FULL_BACKUP="$BACKUP_DIR/sakhistore_backup_$TIMESTAMP.tar.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

echo "Starting backup at $(date)"
echo "================================"

# Backup database
echo "1. Backing up PostgreSQL database..."
docker-compose exec -T postgres pg_dump -U prod_user sakhistore_prod > "$DB_BACKUP"
gzip "$DB_BACKUP"
echo "✓ Database backed up to: ${DB_BACKUP}.gz"

# Backup volumes
echo ""
echo "2. Backing up data volumes..."
docker run --rm \
  --volumes-from sakhistore-postgres \
  -v "$BACKUP_DIR":/backup \
  alpine tar czf /backup/postgres_volume_$TIMESTAMP.tar.gz /var/lib/postgresql/data
echo "✓ Volume backed up"

# Backup application logs
echo ""
echo "3. Backing up application logs..."
tar czf "$BACKUP_DIR/logs_$TIMESTAMP.tar.gz" ./logs/ 2>/dev/null || true
echo "✓ Logs backed up"

# Full system backup
echo ""
echo "4. Creating full backup..."
tar czf "$FULL_BACKUP" \
  --exclude=node_modules \
  --exclude=target \
  --exclude=.git \
  --exclude=dist \
  ./Backend \
  ./Frontend \
  ./Frontend\(react\) \
  ./.env.prod \
  docker-compose.yml \
  nginx.conf \
  2>/dev/null
echo "✓ Full backup created: $FULL_BACKUP"

# Cleanup old backups (keep last 7 days)
echo ""
echo "5. Cleaning up old backups..."
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
echo "✓ Old backups removed"

echo ""
echo "================================"
echo "Backup completed at $(date)"
echo "Backup location: $BACKUP_DIR"
ls -lh $BACKUP_DIR | tail -5
