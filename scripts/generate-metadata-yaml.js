const { join } = require("path");
const { readFile } = require("node:fs/promises");

const { getInstrumentations } = require('../lib/instrumentations');

const LOADED_INSTRUMENTATIONS = getInstrumentations();

const KNOWN_TARGET_LIBRARY_VERSIONS = new Map([
  ["splunk-opentelemetry-instrumentation-elasticsearch", [">=5 <8"]],
  ["splunk-opentelemetry-instrumentation-kafkajs", ["*"]],
  ["splunk-opentelemetry-instrumentation-sequelize", ["*"]],
  ["splunk-opentelemetry-instrumentation-typeorm", [">0.2.28"]],
  ["@opentelemetry/instrumentation-dns", ["*"]],
  ["@opentelemetry/instrumentation-net", ["*"]],
  ["@opentelemetry/instrumentation-http",  ["*"]],
  ["@opentelemetry/instrumentation-grpc", ["1.x"]],
  ["@opentelemetry/instrumentation-aws-sdk",  ["2.x", "3.x"]],
  ["@opentelemetry/instrumentation-redis", ["^2.6.0", "3.x"]],
  ["@opentelemetry/instrumentation-redis-4", ["4.x"]]
]);

const INSTRUMENTATIONS = [
  { name: "@opentelemetry/instrumentation-amqplib", target: "amqplib", },
  { name: "@opentelemetry/instrumentation-aws-sdk", target: "aws-sdk and @aws-sdk", },
  { name: "@opentelemetry/instrumentation-bunyan", target: "bunyan", },
  { name: "@opentelemetry/instrumentation-cassandra-driver", target: "cassandra-driver", },
  { name: "@opentelemetry/instrumentation-connect", target: "connect", },
  { name: "@opentelemetry/instrumentation-dataloader", target: "dataloader", },
  { name: "@opentelemetry/instrumentation-dns", target: "dns", },
  { name: "@opentelemetry/instrumentation-express", target: "express", },
  { name: "@opentelemetry/instrumentation-fastify", target: "fastify", },
  { name: "@opentelemetry/instrumentation-generic-pool", target: "generic-pool", },
  { name: "@opentelemetry/instrumentation-graphql",  target: "graphql", },
  { name: "@opentelemetry/instrumentation-grpc", target: "@grpc/grpc-js", },
  { name: "@opentelemetry/instrumentation-hapi", target: "hapi", },
  { name: "@opentelemetry/instrumentation-http", target: "http", },
  { name: "@opentelemetry/instrumentation-ioredis", target: "ioredis", },
  { name: "@opentelemetry/instrumentation-knex", target: "knex", },
  { name: "@opentelemetry/instrumentation-koa", target: "koa", },
  { name: "@opentelemetry/instrumentation-memcached", target: "memcached", },
  { name: "@opentelemetry/instrumentation-mongodb", target: "mongodb", },
  { name: "@opentelemetry/instrumentation-mongoose", target: "mongoose", },
  { name: "@opentelemetry/instrumentation-mysql", target: "mysql", },
  { name: "@opentelemetry/instrumentation-mysql2", target: "mysql2", },
  { name: "@opentelemetry/instrumentation-nestjs-core", target: "@nestjs/core", },
  { name: "@opentelemetry/instrumentation-net", target: "net", },
  { name: "@opentelemetry/instrumentation-pg", target: "pg", },
  { name: "@opentelemetry/instrumentation-pino", target: "pino", },
  { name: "@opentelemetry/instrumentation-redis", target: "redis", },
  { name: "@opentelemetry/instrumentation-redis-4", target: "redis", },
  { name: "@opentelemetry/instrumentation-restify", target: "restify", },
  { name: "@opentelemetry/instrumentation-router", target: "router", },
  { name: "@opentelemetry/instrumentation-tedious", target: "tedious", },
  { name: "@opentelemetry/instrumentation-winston", target: "winston", },
  { name: "splunk-opentelemetry-instrumentation-elasticsearch", target: "@elastic/elasticsearch", support: "supported", },
  { name: "splunk-opentelemetry-instrumentation-kafkajs", target: "kafkajs", support: "supported", },
  { name: "splunk-opentelemetry-instrumentation-sequelize", target: "sequelize", support: "supported", },
  { name: "splunk-opentelemetry-instrumentation-typeorm", target: "typeorm", support: "supported", },
];

async function getSupportedVersion(instrumentation) {
  const name = instrumentation.instrumentationName;

  const versions = KNOWN_TARGET_LIBRARY_VERSIONS.get(name);

  if (versions !== undefined) {
    return versions;
  }

  return await readMeVersions(name);
}

function isSpace(s) {
  return s === " " || s === "\t" || s === "\n" || s === "\r";
}

async function readMeVersions(instrumentationName) {
  const path = require.resolve(instrumentationName);
  const readmePath = join(path, "../../../README.md");

  const readMe = (await readFile(readmePath, { encoding: "utf8" })).toLowerCase();

  const supportedVersionsHeader = "# supported versions";
  let loc = readMe.indexOf(supportedVersionsHeader);

  if (loc === -1) {
    throw new Error(`Versions not found for ${instrumentationName}`);
  }

  loc += supportedVersionsHeader.length;

  let token = readMe.charAt(loc);

  while (isSpace(token)) {
    loc += 1;
    token = readMe.charAt(loc);
  }

  const nextHashLoc = readMe.indexOf("#", loc);

  return versionLines = readMe
    .substring(loc, nextHashLoc)
    .split("\n")
    .filter(s => s.length > 0)
    .map((s) => {
      return s.replaceAll("`", "").replaceAll("`", "").replace("- ", "");
    });
}

async function getSupportedLibraryVersions(instrumentations) {
  const versions = await Promise.all(instrumentations.map(i => getSupportedVersion(i)));

  const versionsByInstrumentation = {};

  versions.forEach((v, i) => {
    versionsByInstrumentation[instrumentations[i].instrumentationName] = v;
  });

  return versionsByInstrumentation;
}

function getSettingsList() {
  const { listEnvVars } = require("../lib");
  return listEnvVars();
}

function populateSettings(lines) {
  const settings = getSettingsList();
  lines.push("settings:");

  function addSetting(setting) {
    lines.push(`- name: ${setting.name}`);
    lines.push(`  description: ${setting.description}`);
    lines.push(`  default: ${setting.default}`);
    lines.push(`  type: ${setting.type}`);
    lines.push(`  category: ${setting.category}`);
  }

  for (const setting of settings) {
    addSetting(setting);
  }

  return lines;
}

async function populateInstrumentations(lines) {
  const versions = await getSupportedLibraryVersions(LOADED_INSTRUMENTATIONS);

  for (const instrumentation of INSTRUMENTATIONS) {
    lines.push(
      "- keys:",
      `  - "${instrumentation.name}"`,
      "  instrumented_components:",
      `  - name: "${instrumentation.target}"`,
      `    supported_versions: "${versions[instrumentation.name]}"`,
      `  support: ${instrumentation.support ?? "community"}`,
    );
  }

  return lines;
}

async function genMetadata() {
  let lines = [
    "component: Splunk Distribution of OpenTelemetry JavaScript",
    `version: ${require("../package.json").version}`,
  ];

  lines = populateSettings(lines);
  lines = await populateInstrumentations(lines);

  const yaml = lines.join("\n");
  process.stdout.write(yaml);
  process.stdout.write("\n");
}

genMetadata();
