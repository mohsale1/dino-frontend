#!/bin/bash

# Docker Entrypoint Script for Dino Frontend
# Generates runtime configuration and starts nginx

set -e

echo "========================================"
echo "🚀 Dino Frontend Container Starting"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Generate runtime configuration
print_status "Step 1: Generating runtime configuration..."
if /usr/local/bin/generate-config.sh; then
    print_success "Runtime configuration generated"
else
    print_error "Failed to generate runtime configuration"
    exit 1
fi

echo ""

# Step 2: Process nginx configuration template
print_status "Step 2: Processing nginx configuration template..."
print_status "Using Backend URL: ${BACKEND_URL}"

# Substitute environment variables in nginx template
print_status "Processing nginx template..."
if envsubst '${BACKEND_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf; then
    print_success "Template substitution successful"
else
    print_error "Template substitution failed"
    exit 1
fi

# Validate nginx configuration
print_status "Validating nginx configuration..."
if nginx -t 2>&1; then
    print_success "Generated nginx configuration is valid"
else
    print_error "Nginx configuration validation failed"
    cat /etc/nginx/nginx.conf
    exit 1
fi

echo ""

# Step 3: Final validation
print_status "Final nginx configuration validation..."
if nginx -t; then
    print_success "Nginx configuration is ready"
else
    print_error "Final nginx validation failed"
    exit 1
fi

# Step 4: Show active configuration
print_status "Active proxy configuration:"
echo "  Backend URL: ${BACKEND_URL}"
echo "  Proxy Pass: /api/ -> ${BACKEND_URL}/"
echo "  WebSocket: /ws/ -> ${BACKEND_URL}/"
echo ""

# Step 5: Display generated config.js for debugging
if [ -f "/usr/share/nginx/html/config.js" ]; then
    print_status "Generated config.js preview:"
    echo "----------------------------------------"
    head -30 /usr/share/nginx/html/config.js
    echo "----------------------------------------"
    echo ""
fi

# Step 6: Show nginx proxy configuration
print_status "Nginx API proxy configuration:"
echo "----------------------------------------"
grep -A 20 "location /api/" /etc/nginx/nginx.conf || echo "Could not find /api/ location block"
echo "----------------------------------------"
echo ""

print_success "✅ All initialization steps completed successfully!"
echo ""
print_status "Starting nginx..."
echo "========================================"
echo ""

# Start nginx in foreground
exec nginx -g 'daemon off;'