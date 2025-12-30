FROM node:25-alpine as base

WORKDIR /app

ENV PNPM_HOME=/pnpm
ENV CI=1
# Use production in case any dependencies use it in any way
ENV NODE_ENV=production

# Enable node compile cache
ENV NODE_COMPILE_CACHE=/node-cc
RUN mkdir -p $NODE_COMPILE_CACHE

FROM base as base_deps

ENV CI=1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN corepack enable
RUN corepack prepare --activate

# Install dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM base_deps as build

COPY tsconfig.json tsdown.config.ts ./
COPY src/ src/

RUN node --run build

FROM base_deps AS docs

COPY docs/openapi.yaml docs/openapi.yaml

RUN node --run docs

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
