#!/bin/bash
# Health check script for production deployment

echo "===== Sakhi Store - Health Check ====="
echo ""

# Check if containers are running
echo "1. Checking container status..."
if ! command -v docker-compose &> /dev/null; then
    echo "ERROR: docker-compose not found"
    exit 1
fi

containers=$(docker-compose ps -q)
if [ -z "$containers" ]; then
    echo "ERROR: No containers running"
    exit 1
fi

docker-compose ps
echo ""

# Check backend health
echo "2. Checking Backend API health..."
backend_health=$(curl -s http://localhost:8080/api/actuator/health || echo '{"status":"DOWN"}')
if echo "$backend_health" | grep -q '"status":"UP"'; then
    echo "✓ Backend is healthy"
else
    echo "✗ Backend is unhealthy"
fi
echo ""

# Check database connectivity
echo "3. Checking Database connectivity..."
db_check=$(docker-compose exec -T postgres pg_isready -U prod_user 2>/dev/null || echo "failed")
if echo "$db_check" | grep -q "accepting"; then
    echo "✓ Database is accessible"
else
    echo "✗ Database is not accessible"
fi
echo ""

# Check disk space
echo "4. Checking Disk Space..."
disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
echo "Disk usage: ${disk_usage}%"
if [ "$disk_usage" -gt 80 ]; then
    echo "⚠ WARNING: Disk usage is above 80%"
fi
echo ""

# Check memory usage
echo "5. Checking Memory Usage..."
docker-compose stats --no-stream
echo ""

# Check log errors
echo "6. Checking recent error logs..."
backend_errors=$(docker-compose logs backend --tail=50 | grep -i error | wc -l)
echo "Recent errors in backend: $backend_errors"
echo ""

echo "===== Health Check Complete ====="
