FROM node:10.12.0

USER node
ENV TZ=UTC
RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ["binding.gyp", "package*.json", "*.lock", "./scripts", "./src", "./"]
#RUN npm install

COPY --chown=node:node ./ .
