# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────
# Frontend Dockerfile — Multi-stage
# Stage 1: build Vite
# Stage 2: servir con nginx + proxy al backend
# ─────────────────────────────────────────────────────────────────

# ── Stage 1: Build ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias primero (aprovecha cache de capas)
# --mount=type=cache persiste el caché de npm entre builds (BuildKit)
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --cache /root/.npm

# Copiar código fuente y construir
COPY . .
RUN npm run build

# ── Stage 2: nginx ────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Copiar archivos estáticos del build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx (proxy a backend)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
