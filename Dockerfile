FROM node:18-alpine as build

RUN corepack enable

WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .
COPY .npmrc .

ENV HUSKY=0
# Install dependencies
RUN pnpm install --frozen-lockfile


FROM node:18-alpine

RUN corepack enable

WORKDIR /app

COPY . .
COPY --from=build /app/node_modules node_modules

RUN pnpm --silent run docs

# Run with...
# Source maps enabled, since it does not affect performance from what I found
ENV NODE_OPTIONS="--enable-source-maps"
# Warnings disabled, we know what we're doing and they're annoying
ENV NODE_NO_WARNINGS=1
# Use production in case any dependencies use it in any way
ENV NODE_ENV=production

CMD ["pnpm", "--silent", "start"]
