# Multi-stage build for Dino Frontend

# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:18-alpine AS build

WORKDIR /app

# Copy package manifests and .npmrc first for better layer caching
COPY package*.json .npmrc ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

# Build production bundle
ENV GENERATE_SOURCEMAP=false
ENV NODE_ENV=production

RUN ls -la

RUN npm run build


# ─── Stage 2: Serve ───────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Install runtime tools
RUN apk add --no-cache curl bash gettext

# Remove default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy built static assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config template
COPY nginx/nginx.conf.template /etc/nginx/nginx.conf.template

# Copy and register entrypoint
COPY nginx/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set correct permissions on static files
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
