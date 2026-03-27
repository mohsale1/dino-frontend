# Multi-stage build for Dino Application UI

# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

ENV GENERATE_SOURCEMAP=false
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Serve
FROM nginx:1.27-alpine

RUN apk add --no-cache curl bash gettext
RUN rm -f /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx/nginx.conf.template /etc/nginx/nginx.conf.template

# Copy entrypoint and verify it landed correctly before chmod
COPY nginx/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN test -f /usr/local/bin/docker-entrypoint.sh \
    || { echo "ERROR: docker-entrypoint.sh was not copied — check build context"; exit 1; }
RUN sed -i 's/\r//' /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]