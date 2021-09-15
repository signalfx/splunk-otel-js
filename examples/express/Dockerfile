FROM node:16-alpine

USER node
ENV TZ=UTC
RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ["package*.json", "*.lock", "./"]
RUN npm install

COPY --chown=node:node ./ .

EXPOSE 80
ENV PORT=80
CMD ["npm", "run", "start"]
