# Build stage
FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.29.2 --activate

WORKDIR /app

# Vite resolves env vars at build time — VITE_* must be available before `vite build`.
ARG VITE_API_URL=http://localhost:4000/api
ARG VITE_APP_NAME="Admin"
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Runtime stage — static SPA via nginx
FROM nginx:alpine

# Default nginx.conf serves /usr/share/nginx/html with SPA fallback (try_files ... /index.html)
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace default nginx site config with SPA-aware variant
RUN printf '%s\n' \
    'server {' \
    '  listen 80;' \
    '  server_name _;' \
    '  root /usr/share/nginx/html;' \
    '  index index.html;' \
    '  gzip on;' \
    '  gzip_types text/css application/javascript application/json image/svg+xml;' \
    '  location /assets/ {' \
    '    expires 1y;' \
    '    add_header Cache-Control "public, immutable";' \
    '    try_files $uri =404;' \
    '  }' \
    '  location / {' \
    '    try_files $uri $uri/ /index.html;' \
    '  }' \
    '}' \
    > /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1
