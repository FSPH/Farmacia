# Estágio 1: lint + build (React/Vite)
FROM node:24-alpine AS builder
WORKDIR /app

# puppeteer está nas dependências, mas o bundle não usa o Chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Fixada no bundle em tempo de build. Vazia = usa http(s)://<host-do-navegador>:3000
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY . .
RUN npm run lint
RUN npm run build

# Estágio 2: servidor estático Node (server.mjs), sem root, porta 8080.
# Uso só na rede interna, sem proxy reverso na frente.
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production \
    PORT=8080
COPY server.mjs ./
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:8080/ || exit 1

CMD ["node", "server.mjs"]
