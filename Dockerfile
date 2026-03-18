# Multi-stage build for Dino Frontend
# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json .npmrc ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
ENV GENERATE_SOURCEMAP=false
ENV NODE_ENV=production
RUN npm run build

# Production stage
FROM nginx:alpine

# Install required tools
RUN apk add --no-cache curl bash gettext

# Copy built application
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY deployment/nginx.conf.template /etc/nginx/nginx.conf.template

# Copy scripts
COPY deployment/scripts/generate-config.sh /usr/local/bin/generate-config.sh
COPY deployment/scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# Make scripts executable
RUN chmod +x /usr/local/bin/generate-config.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

# Set proper permissions
RUN chmod -R 755 /usr/share/nginx/html

# Remove default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Use custom entrypoint
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]