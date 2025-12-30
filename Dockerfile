FROM node:25-alpine AS base

WORKDIR /app

ENV PNPM_HOME=/pnpm
ENV CI=1
# Use production in case any dependencies use it in any way
ENV NODE_ENV=production

# Enable node compile cache
ENV NODE_COMPILE_CACHE=/node-cc
RUN mkdir -p $NODE_COMPILE_CACHE

FROM base AS base_deps

ENV CI=1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN npm i -g npm@latest
RUN npm i -g --force corepack@latest
RUN corepack enable
RUN corepack prepare --activate

# Install dependencies
RUN --mount=type=cache,id=s/c47f3895-fff0-42c4-b1f7-cee7f61e6613-pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

FROM base_deps AS build

COPY tsconfig.json tsdown.config.ts ./
COPY src/ src/

RUN node --run build

FROM base_deps AS docs

COPY docs/openapi.yaml docs/openapi.yaml

RUN --mount=type=cache,id=s/c47f3895-fff0-42c4-b1f7-cee7f61e6613-pnpm,target=/pnpm/store \
    node --run docs

FROM base

COPY src/ src/
COPY package.json pnpm-workspace.yaml ./

COPY --from=build /app/dist dist/
COPY --from=docs /app/redoc-static.html .

# Run with...
# Source maps enabled, since it does not affect performance from what I found
ENV NODE_OPTIONS="--enable-source-maps"
# Warnings disabled, we know what we're doing and they're annoying
ENV NODE_NO_WARNINGS=1

CMD ["node", "--run", "start"]
