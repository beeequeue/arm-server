FROM node:18-alpine

RUN corepack enable

WORKDIR /app

COPY . .

# Source maps enabled, since it does not affect performance from what I found
ENV HUSKY=0
# Install dependencies
RUN pnpm install --frozen-lockfile

# Run with...
# Source maps enabled, since it does not affect performance from what I found
ENV NODE_OPTIONS="--enable-source-maps"
# Warnings disabled, we know what we're doing and they're annoying
ENV NODE_NO_WARNINGS=1
# Use production in case any dependencies use it in any way
ENV NODE_ENV=production

CMD ["pnpm", "--silent", "start"]
