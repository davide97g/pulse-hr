FROM oven/bun:1-slim AS runtime
WORKDIR /app

# Copy monorepo manifests for workspace resolution.
COPY package.json bun.lock* ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/api/package.json ./apps/api/package.json

# Install production deps for the whole workspace; Bun resolves the
# `@pulse-hr/shared` workspace symlink.
RUN bun install --frozen-lockfile --production

# Copy source (after deps so install caches).
COPY packages/shared ./packages/shared
COPY CHANGELOG.md ./CHANGELOG.md
COPY apps/api ./apps/api

WORKDIR /app/apps/api
RUN bun ./scripts/build-changelog.ts

ENV NODE_ENV=production
EXPOSE 10000
CMD ["bun", "src/index.ts"]
