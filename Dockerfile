FROM node:14.17-alpine

WORKDIR /server

COPY . /server
RUN yarn install

EXPOSE 3000
CMD [ "yarn", "start" ]
