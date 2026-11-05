# ---------- 构建阶段 ----------
FROM node:22-alpine AS builder
WORKDIR /app

# 使用 package.json 中 packageManager 指定的 pnpm 版本
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

# 先复制依赖清单，充分利用 Docker 层缓存
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# 复制源码并构建
COPY . .
# 构建期 env 校验要求 .env 存在：优先使用构建上下文里的 .env，否则回退到模板
RUN [ -f .env ] || cp .env.example .env
RUN pnpm build

# ---------- 运行阶段 ----------
# unprivileged 镜像默认以非 root 用户 (uid 101) 运行，监听 8080
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1

# 镜像内置的 entrypoint 会以非 root 用户启动 nginx
