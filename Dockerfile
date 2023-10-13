FROM node:16 AS build-amd64
WORKDIR /splunk-otel-js
COPY . .
RUN npm install
RUN npm run compile
RUN npm run prebuild:os '14.0.0' '15.0.0' '16.0.0' '17.0.1' '18.0.0'
RUN npm pack && tar xf splunk-otel-$(npm view @splunk/otel version).tgz
RUN npm prune --omit=dev && cp -r node_modules/ package

FROM node:16 AS build-arm64

WORKDIR /splunk-otel-js
COPY . .
RUN npm install
RUN npm run compile
RUN npm run prebuild:os '14.0.0' '15.0.0' '16.0.0' '17.0.1' '18.0.0'
RUN npm pack && tar xf splunk-otel-$(npm view @splunk/otel version).tgz
RUN npm prune --omit=dev && cp -r node_modules/ package

FROM ppc64le/node:16 AS build-ppc64le
WORKDIR /splunk-otel-js
COPY . .
RUN npm install
RUN npm run compile
RUN npm run prebuild:os '14.0.0' '15.0.0' '16.0.0' '17.0.1' '18.0.0'
RUN npm pack && tar xf splunk-otel-$(npm view @splunk/otel version).tgz
RUN npm prune --omit=dev && cp -r node_modules/ package

FROM build-$TARGETARCH AS build

FROM busybox
ARG TARGETARCH
LABEL org.opencontainers.image.source="https://github.com/signalfx/splunk-otel-js"
LABEL org.opencontainers.image.description="Splunk Distribution of OpenTelemetry Node.js Instrumentation"

COPY --from=build /splunk-otel-js/package /autoinstrumentation
RUN chmod -R go+r /autoinstrumentation
RUN cd /autoinstrumentation && ln -s ./instrument.js /autoinstrumentation/autoinstrumentation.js
