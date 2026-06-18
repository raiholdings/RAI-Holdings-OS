# RAI LLMs Gateway — multi-stage build
# Build: npm ci + tsc -> dist/ ; Runtime: node dist/server.js

# ---- build stage ----
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# ---- runtime stage ----
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
# Prod deps only — migrate runs as plain JS (scripts/migrate.mjs), no tsx needed.
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY sql ./sql
COPY scripts ./scripts
EXPOSE 8080
CMD ["node", "dist/server.js"]
