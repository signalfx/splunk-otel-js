FROM node:16-alpine

ENV TZ=UTC
WORKDIR /home/node/app

COPY --chown=node:node ["package*.json", "*.lock", "./"]
RUN npm install

COPY --chown=node:node ./ .

EXPOSE 80
ENV PORT=80
CMD ["npm", "run", "start"]
