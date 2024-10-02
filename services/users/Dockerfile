FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .


ENV PORT=8000

EXPOSE $PORT

CMD ["yarn", "start"]