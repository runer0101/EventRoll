# ─── Stage 1: Dependencias de producción ──────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

# ─── Stage 2: Runner ───────────────────────────────────────────────
FROM node:22-alpine AS runner

# wget para healthcheck
RUN apk add --no-cache wget

# Usuario no-root para seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copiar solo lo necesario
COPY --from=deps /app/node_modules ./node_modules
COPY src/ ./src/
COPY shared/ ./shared/
COPY package.json ./

# Directorio de logs con permisos correctos
RUN mkdir -p logs && chown appuser:appgroup logs

ENV NODE_ENV=production
EXPOSE 3000

USER appuser

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
