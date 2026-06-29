# 本地先构建：pnpm --filter server run build
FROM node:latest
RUN npm install -g pnpm@10.11.0
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/server/package.json ./apps/server/
COPY patches ./patches
RUN pnpm install --frozen-lockfile --prod

COPY apps/server/dist ./apps/server/dist
WORKDIR /app/apps/server
EXPOSE 3000
CMD ["node", "dist/main.js"]
