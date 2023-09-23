FROM node:20.7-alpine 

WORKDIR /usr/src/app

COPY ./package.json ./

RUN yarn install --production

COPY ./src/ ./

CMD ["yarn", "start"]
