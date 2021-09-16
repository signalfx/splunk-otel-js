FROM node:16-alpine

USER node
ENV TZ=UTC
RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ["package*.json", "*.lock", "./"]
RUN cat package.json
RUN npm install

COPY --chown=node:node ./ .

CMD ["npm", "run", "start"]
