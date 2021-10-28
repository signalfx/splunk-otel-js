# Set up the environment, install deps
FROM node:16-alpine as base
RUN apk add g++ make python

USER node
ENV TZ=UTC
RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ["package*.json", "*.lock", "./"]
RUN npm install

COPY --chown=node:node ./ .


# Install deps for examples
FROM base as published

RUN cd examples/basic && npm install
RUN cd examples/express && npm install
RUN cd examples/log-injection && npm install
RUN cd examples/mixed && npm install

## Project root doesn't have start script defined
## Working dir(-w) must be provided to one of the example dirs
CMD ["npm", "run", "start"]


# Compile the package and use it in examples
FROM published as compiled

RUN npm run compile
RUN mv `npm pack` /tmp/splunk-otel.tgz
RUN cd examples/basic && npm i /tmp/splunk-otel.tgz
RUN cd examples/express && npm i /tmp/splunk-otel.tgz
RUN cd examples/log-injection && npm i /tmp/splunk-otel.tgz
RUN cd examples/mixed && npm i /tmp/splunk-otel.tgz
