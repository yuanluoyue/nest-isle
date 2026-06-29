#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SERVER_ENV="$PROJECT_ROOT/apps/server/.env"
ADMIN_ENV="$PROJECT_ROOT/apps/admin/.env"
DOCKER_ENV="$SCRIPT_DIR/.env"

# 检查 .env 是否存在
if [ ! -f "$SERVER_ENV" ]; then
  echo "Error: $SERVER_ENV not found"
  echo "Copy apps/server/.env.example to apps/server/.env and modify as needed"
  exit 1
fi
if [ ! -f "$ADMIN_ENV" ]; then
  echo "Error: $ADMIN_ENV not found"
  echo "Copy apps/admin/.env.example to apps/admin/.env and modify as needed"
  exit 1
fi

# 加载 server .env（APP_NAME, DB_USER, DB_PASSWORD 等）
set -a
source "$SERVER_ENV"
# 加载 admin .env（VITE_APP_NAME）
source "$ADMIN_ENV"
# 加载 docker .env（端口映射等，会覆盖上面的端口）
if [ -f "$DOCKER_ENV" ]; then
  source "$DOCKER_ENV"
fi
set +a

# 派生 docker 专用变量
APP_NAME=${APP_NAME:-nest-isle}
POSTGRES_DB=${POSTGRES_DB:-$(echo "$APP_NAME" | tr '-' '_')}
COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME:-$APP_NAME}
export APP_NAME POSTGRES_DB COMPOSE_PROJECT_NAME

echo "============================================"
echo "  Project:  $APP_NAME"
echo "  Database: $POSTGRES_DB"
echo "  Frontend: http://localhost:${ADMIN_PORT:-5173}"
echo "  Backend:  http://localhost:${PORT:-3000}/api"
echo "============================================"

# 确保数据目录存在
mkdir -p "$PROJECT_ROOT/data/postgres" "$PROJECT_ROOT/data/redis" "$PROJECT_ROOT/data/minio"

# 启动或管理服务
ACTION="${1:-up}"
shift 2>/dev/null || true

if [ "$ACTION" = "up" ]; then
  # 本地构建产物
  echo "Building server..."
  pnpm --filter server run build
  echo "Building admin..."
  pnpm --filter admin run build
  echo ""

  docker-compose -f "$SCRIPT_DIR/docker-compose.yml" up -d --build "$@"
else
  docker-compose -f "$SCRIPT_DIR/docker-compose.yml" "$ACTION" "$@"
fi

echo ""
if [ "$ACTION" = "up" ]; then
  echo "All services started. Use 'pnpm docker:down' to stop."
fi
