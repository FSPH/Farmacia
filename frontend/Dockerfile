# Estágio 1: lint + build (React/Vite)
FROM node:24-alpine AS builder
WORKDIR /app

# puppeteer está nas dependências, mas o bundle não usa o Chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Fixadas no bundle em tempo de build (quem chama essas URLs é o navegador).
# Vazias = mesmo host que o usuário abriu: API :3005 | auth :3008 | login SA :3007
ARG VITE_API_BASE_URL=""
ARG VITE_API_AUTH=""
ARG VITE_API_SA=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_API_AUTH=$VITE_API_AUTH \
    VITE_API_SA=$VITE_API_SA

COPY . .
RUN npm run lint
RUN npm run build

# Estágio 2: servidor estático Node (server.mjs), sem root, porta 5160.
# Uso só na rede interna, sem proxy reverso na frente.
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production \
    PORT=5160
COPY server.mjs ./
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 5160

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:5160/ || exit 1

CMD ["node", "server.mjs"]
