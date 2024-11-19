FROM node:22-alpine AS runtime_deps

RUN corepack enable

WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .
COPY .npmrc .

ENV CI=1
ENV NODE_ENV=production
# Install dependencies
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS docs

RUN corepack enable

WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .
COPY .npmrc .
COPY docs/openapi.yaml docs/openapi.yaml

ENV CI=1
# Install dependencies
RUN pnpm install --frozen-lockfile

RUN pnpm run docs

FROM node:22-alpine

RUN corepack enable

WORKDIR /app

COPY . .
COPY --from=runtime_deps /app/node_modules node_modules
COPY --from=docs /app/redoc-static.html .

# Run with...
# Source maps enabled, since it does not affect performance from what I found
ENV NODE_OPTIONS="--enable-source-maps"
# Warnings disabled, we know what we're doing and they're annoying
ENV NODE_NO_WARNINGS=1
# Use production in case any dependencies use it in any way
ENV NODE_ENV=production

CMD ["pnpm", "--silent", "start"]
