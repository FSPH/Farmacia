# Estágio 1: compila o TypeScript (barra o build se houver erro de tipo)
FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npx tsc -p .

# Estágio 2: execução só com dependências de produção
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

COPY --from=builder /app/dist ./dist
# Logo usada nos PDFs (utils/pdfBrandHeader resolve ../../public a partir de dist/utils)
COPY public ./public

# settings.data.json e notificacoes.json são gravados em tempo de execução.
# Ficam em /app/data (volume) e o código os acessa por symlink em dist/utils.
COPY utils/settings.data.json ./defaults/settings.data.json
RUN mkdir -p /app/data \
    && ln -sf /app/data/settings.data.json dist/utils/settings.data.json \
    && ln -sf /app/data/notificacoes.json dist/utils/notificacoes.json \
    && chown -R node:node /app/data

USER node
VOLUME ["/app/data"]
EXPOSE 3000

# Qualquer resposta HTTP indica que o Express está de pé (a API não tem rota /health).
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(()=>process.exit(0),()=>process.exit(1))"

CMD ["sh", "-c", "[ -f /app/data/settings.data.json ] || cp /app/defaults/settings.data.json /app/data/; exec node dist/farmacia.js"]
