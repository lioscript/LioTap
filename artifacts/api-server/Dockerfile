FROM node:22-slim AS builder

RUN npm install -g pnpm@10

WORKDIR /workspace

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @workspace/api-server run build

FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /workspace/artifacts/api-server/dist ./dist
COPY --from=builder /workspace/artifacts/api-server/logo.png ./logo.png
COPY --from=builder /workspace/artifacts/api-server/games ./games

RUN mkdir -p /data

ENV DATA_DIR=/data

VOLUME ["/data"]

EXPOSE 8080

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
