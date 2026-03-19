#!/bin/bash
set -e

# ─── Environment Variables ────────────────────────────────────────────────────
#
# BACKEND_URL  — Internal URL nginx uses to proxy /api/ requests.
#                Never exposed to the browser.
#                Default: https://api.myapp.com
#
# API_BASE_URL — Relative path the React app prefixes every API call with.
#                Must stay as /api/v1 (relative) so browser requests go through
#                nginx on the same origin instead of hitting the backend directly.
#                Default: /api/v1
#
# ─────────────────────────────────────────────────────────────────────────────

BACKEND_URL="${BACKEND_URL:-https://api.myapp.com}"
API_BASE_URL="${API_BASE_URL:-/api/v1}"

echo "[entrypoint] BACKEND_URL  = ${BACKEND_URL}  (nginx proxy target)"
echo "[entrypoint] API_BASE_URL = ${API_BASE_URL}  (browser-facing prefix)"

# ─── Generate runtime config.js ───────────────────────────────────────────────
# Overwrites the static config.js baked into the image so the React app
# picks up the correct env vars without needing a rebuild.
cat > /usr/share/nginx/html/config.js <<JSEOF
window.APP_CONFIG = {
  API_BASE_URL: "${API_BASE_URL}",
  BACKEND_URL: "${BACKEND_URL}",
  APP_NAME: "${APP_NAME:-Dino}",
  APP_VERSION: "${APP_VERSION:-1.0.0}",
  APP_ENV: "${APP_ENV:-production}",
  DEBUG_MODE: ${DEBUG_MODE:-false},
  ENABLE_ANALYTICS: ${ENABLE_ANALYTICS:-true},
  ENABLE_QR_CODES: ${ENABLE_QR_CODES:-true},
  ENABLE_NOTIFICATIONS: ${ENABLE_NOTIFICATIONS:-true},
  API_TIMEOUT: ${API_TIMEOUT:-30000},
  JWT_EXPIRY_HOURS: ${JWT_EXPIRY_HOURS:-24},
  SESSION_TIMEOUT_MINUTES: ${SESSION_TIMEOUT_MINUTES:-60},
  LOG_LEVEL: "${LOG_LEVEL:-info}",
  ENABLE_CONSOLE_LOGGING: ${ENABLE_CONSOLE_LOGGING:-false},
  GENERATE_SOURCEMAP: false
};
JSEOF

# ─── Inject BACKEND_URL into nginx config ─────────────────────────────────────
# Only substitute $BACKEND_URL — leave all other nginx $ variables untouched.
envsubst '${BACKEND_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# ─── Validate and start nginx ─────────────────────────────────────────────────
nginx -t
exec nginx -g 'daemon off;'
