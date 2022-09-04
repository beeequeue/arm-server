FROM node:16-alpine

WORKDIR /server

COPY . /server
RUN pnpm install --frozen-lockfile

EXPOSE 3000
CMD [ "pnpm", "start" ]
