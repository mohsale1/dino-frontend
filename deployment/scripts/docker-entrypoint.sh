#!/bin/bash

# Docker Entrypoint Script for Dino Frontend
# Generates runtime configuration and starts nginx

set -e

echo "========================================"
echo "🚀 Dino Frontend Container Starting"
echo "========================================"
echo ""

# Set default BACKEND_URL if not provided
if [ -z "$BACKEND_URL" ]; then
    export BACKEND_URL="https://dino-backend-prod-781503667260.us-central1.run.app"
    echo "⚠️  BACKEND_URL not set, using default: $BACKEND_URL"
fi

echo "📋 Configuration:"
echo "  Backend URL: $BACKEND_URL"
echo "  Port: 8080"
echo ""

# Step 1: Generate runtime configuration
echo "🔧 Generating runtime configuration..."
if /usr/local/bin/generate-config.sh; then
    echo "✅ Runtime configuration generated"
else
    echo "❌ Failed to generate runtime configuration"
    exit 1
fi

echo ""

# Step 2: Process nginx configuration template
echo "🔧 Processing nginx configuration..."
if envsubst '${BACKEND_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf; then
    echo "✅ Nginx template processed"
else
    echo "❌ Failed to process nginx template"
    exit 1
fi

# Step 3: Validate nginx configuration
echo "🔍 Validating nginx configuration..."
if nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration validation failed"
    nginx -t
    exit 1
fi

echo ""
echo "✅ All initialization steps completed!"
echo ""
echo "🚀 Starting nginx on port 8080..."
echo "========================================"
echo ""

# Start nginx in foreground
exec nginx -g 'daemon off;'
 ""

# Start nginx in foreground
exec nginx -g 'daemon off;'