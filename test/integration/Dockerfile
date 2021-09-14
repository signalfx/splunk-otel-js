FROM node:16-alpine

ENV TZ=UTC
WORKDIR /home/node/app

COPY --chown=node:node ["package*.json", "*.lock", "./"]
RUN npm install

COPY --chown=node:node ./ .

CMD ["npm", "run", "start"]
