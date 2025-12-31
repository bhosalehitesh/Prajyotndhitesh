# Production Deployment Quick Reference

## Quick Start
```bash
# 1. Prepare environment
cp .env.prod .env
# Edit .env with production values

# 2. Build and deploy
docker-compose build --no-cache
docker-compose up -d

# 3. Check status
docker-compose ps
docker-compose logs -f backend

# 4. Verify health
curl http://localhost:8080/api/actuator/health
```

## Important Configuration Files

### Backend
- **application-prod.properties** - Production Spring Boot configuration
- **.env.prod** - Production environment variables
- **Dockerfile** - Backend container image
- **init-db.sql** - Database initialization script
- **db/migration/** - Flyway database migration scripts

### Frontend
- **.env.production** - React production environment variables
- **Dockerfile** - React build and nginx serving
- **nginx.conf** - Nginx configuration for React

### Docker
- **docker-compose.yml** - Complete stack configuration
- **nginx.conf** - Main reverse proxy configuration

## Production Checklist

### Before Deployment
1. ✓ Update all credentials in `.env.prod`
2. ✓ Generate strong JWT secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. ✓ Obtain SSL certificates (place in `ssl/` directory)
4. ✓ Verify database is ready
5. ✓ Test all third-party integrations

### Environment Variables Required
```
# Database
DB_URL=jdbc:postgresql://host:5432/db
DB_USERNAME=user
DB_PASSWORD=pass

# Razorpay (LIVE keys)
RAZORPAY_KEY=rzp_live_xxx
RAZORPAY_SECRET=xxx

# Cloudinary
CLOUDINARY_NAME=xxx
CLOUDINARY_KEY=xxx
CLOUDINARY_SECRET=xxx

# JWT (generate new)
JWT_SECRET=xxxxxxxxxxxx (min 64 chars)

# Email
MAIL_USERNAME=email@gmail.com
MAIL_PASSWORD=app_password

# SMS
SMS_KUTILITY_KEY=xxx
SMS_KUTILITY_SECRET=xxx

# Store
STORE_DOMAIN=https://smartbiz.ltd
CORS_ALLOWED_ORIGINS=https://smartbiz.ltd,https://www.smartbiz.ltd
```

## Common Commands

### Monitoring
```bash
# View all containers
docker-compose ps

# View logs
docker-compose logs -f backend          # Backend logs
docker-compose logs -f frontend         # Frontend logs
docker-compose logs -f nginx            # Nginx logs
docker-compose logs -f postgres         # Database logs

# Check health
curl http://localhost:8080/api/actuator/health

# Database connection
docker-compose exec postgres psql -U prod_user -d sakhistore_prod
```

### Maintenance
```bash
# Database backup
docker-compose exec postgres pg_dump -U prod_user sakhistore_prod > backup.sql

# Restore database
docker-compose exec -T postgres psql -U prod_user sakhistore_prod < backup.sql

# Clear cache
docker-compose exec backend curl -X DELETE http://localhost:8080/api/cache

# Restart service
docker-compose restart backend
docker-compose restart frontend
docker-compose restart nginx
```

### Scaling
```bash
# Scale backend (if needed)
docker-compose up -d --scale backend=3

# View resource usage
docker-compose stats

# Update and redeploy
git pull origin main
docker-compose build --no-cache
docker-compose up -d
```

## Troubleshooting

### Database Connection Error
- Check DB_URL, DB_USERNAME, DB_PASSWORD in .env
- Ensure PostgreSQL is running: `docker-compose logs postgres`
- Verify network: `docker network ls`

### API Not Responding
- Check backend logs: `docker-compose logs backend`
- Verify health endpoint: `curl http://localhost:8080/api/actuator/health`
- Check port 8080 is open

### SSL Certificate Issues
- Verify files in `ssl/` directory: `cert.pem` and `key.pem`
- Update domain in nginx.conf
- Restart nginx: `docker-compose restart nginx`

### Container Won't Start
```bash
# View detailed error
docker-compose logs service_name

# Rebuild
docker-compose build --no-cache service_name

# Restart all
docker-compose down
docker-compose up -d
```

## Performance Tuning

### Database
```bash
# Connect to database
docker-compose exec postgres psql -U prod_user -d sakhistore_prod

# Check slow queries
SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
```

### Application
- Monitor CPU/Memory: `docker-compose stats`
- Check JVM settings in Dockerfile
- Enable caching for frequently accessed data

### Nginx
- HTTP/2 enabled (in reverse proxy nginx.conf)
- Gzip compression enabled
- Static asset caching enabled

## Emergency Procedures

### Rollback
```bash
# Stop current containers
docker-compose down

# Restore previous database
docker-compose exec -T postgres psql -U prod_user sakhistore_prod < backup_old.sql

# Run previous version
git checkout previous-tag
docker-compose build
docker-compose up -d
```

### Full System Restart
```bash
docker-compose restart
# or
docker-compose down && docker-compose up -d
```

## Support & Escalation
- Backend API: http://localhost:8080/api
- Frontend: http://localhost:3000
- Monitoring Dashboard: [Your monitoring tool]
- On-Call: [Contact info]

---
For detailed deployment guide, see DEPLOYMENT.md
For comprehensive checklist, see DEPLOYMENT_CHECKLIST.md
