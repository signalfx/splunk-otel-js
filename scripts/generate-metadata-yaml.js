const { join, dirname } = require("path");
const { access, readFile, constants } = require("node:fs/promises");

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

class LineWriter {
  constructor() {
    this.lines = [];
    this.indent = 0;
    this.indents = [];
  }

  pushIndent(indent) {
    this.indent += indent;
    this.indents.push(indent);
  }

  popIndent(n) {
    if (this.indents.length > 0) {

      if (n === undefined) {
        n = 1;
      }

      for (let i = 0; i < Math.min(this.indents.length, n); i++) {
        this.indent -= this.indents.pop();
      }
    }
  }

  push(lines) {
    if (!Array.isArray(lines)) {
      lines = [lines];
    }

    if (this.indent > 0) {
      const indent = " ".repeat(this.indent);
      for (const line of lines) {
        this.lines.push(indent + line);
      }

      return;
    }

    for (const line of lines) {
      this.lines.push(line);
    }
  }

  join() {
    return this.lines.join("\n");
  }
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

function populateSettings(writer) {
  const settings = getSettingsList();
  writer.push("settings:");

  function addSetting(setting) {
    writer.push(`- env: ${setting.name}`);
    writer.pushIndent(2);
    writer.push([
      `description: ${setting.description}`,
      `default: ${setting.default}`,
      `type: ${setting.type}`,
      `category: ${setting.category}`,
    ]);
    writer.popIndent();
  }

  for (const setting of settings) {
    addSetting(setting);
  }
}

async function populateInstrumentations(writer) {
  const versions = await getSupportedLibraryVersions(LOADED_INSTRUMENTATIONS);

  writer.push("instrumentations:");
  writer.pushIndent(2);
  for (const instrumentation of INSTRUMENTATIONS) {
    writer.push("- keys:");
    writer.pushIndent(2);
    writer.push(`- "${instrumentation.name}"`);
    writer.push("instrumented_components:");
    writer.pushIndent(2);
    writer.push(`- name: "${instrumentation.target}"`);
    writer.pushIndent(2);
    writer.push(`supported_versions: "${versions[instrumentation.name]}"`);
    writer.popIndent(2);
    writer.push(`support: ${instrumentation.support ?? "community"}`,);
    writer.popIndent();
  }
  writer.popIndent();
}

function populateResourceDetectors(writer) {
  const detectors = [
    {
      key: "PROCESS",
      description: "Process info detector",
      attributes: [
        "process.pid",
        "process.executable.path",
        "process.runtime.version",
        "process.runtime.name",
      ],
    },
    {
      key: "OS",
      description: "Operating system detector",
      attributes: [
        "os.type",
        "os.description",
      ],
    },
    {
      key: "HOST",
      description: "Host detector",
      attributes: [
        "host.name",
        "host.arch"
      ],
    },
    {
      key: "CONTAINER",
      description: "Container ID detector",
      attributes: [
        "container.id",
      ],
    },
    {
      key: "DISTRO",
      description: "Distribution version detector",
      attributes: [
        "splunk.distro.version",
      ],
    }
  ];

  writer.push("resource_detectors:");
  writer.pushIndent(2);

  for (const detector of detectors) {
    writer.push(`- key: ${detector.key}`);
    writer.pushIndent(2);
    writer.push(`description: ${detector.description}`),
    writer.push("attributes:")
    writer.pushIndent(2);

    for (const attr of detector.attributes) {
      writer.push(`- id: ${attr}`);
    }

    writer.popIndent();
    writer.push("support: supported");
    writer.popIndent();
  }

  writer.popIndent();
}

async function findPackageJson(packageName, maxDepth) {
  if (maxDepth === undefined) {
    maxDepth = 3;
  }

  let basepath = dirname(require.resolve(packageName));
  for (let i = 0; i < maxDepth; i++) {
    const packageJsonPath = join(basepath, "package.json");
    try {
      await access(packageJsonPath, constants.F_OK);
      return packageJsonPath;
    } catch (e) {
      basepath = join(basepath, "..");
    }
  }

  return undefined;
}

function isExperimental(dependency, version) {
  return dependency.startsWith("@opentelemetry") && version.startsWith("0");
}

async function populateDependencyInfo(dependency, version, writer) {
    const status = isExperimental(dependency, version) ? "experimental" : "stable";

    const pkgJsonPath = await findPackageJson(dependency);

    let url = undefined;

    if (pkgJsonPath) {
      const pkgJson = JSON.parse(await readFile(pkgJsonPath, { encoding: "utf-8" }));
      url = pkgJson.homepage;
    }

    writer.push(`- name: "${dependency}"`);
    writer.pushIndent(2);
    writer.push(`version: "${version}"`);
    writer.push(`stability: ${status}`);

    if (url) {
      writer.push(`source_href: "${url}"`);
    }

    writer.popIndent();
}

async function populateDependencies(writer) {
  const deps = require(join(__dirname, "../package.json")).dependencies;
  writer.push("dependencies:")
  writer.pushIndent(2);

  const promises = Object.keys(deps).map(dep => populateDependencyInfo(dep, deps[dep], writer));
  await Promise.all(promises);

  writer.popIndent();
}

async function genMetadata() {
  const writer = new LineWriter();
  writer.push([
    "component: Splunk Distribution of OpenTelemetry JavaScript",
    `version: ${require("../package.json").version}`,
  ]);

  populateSettings(writer);
  await populateInstrumentations(writer);
  populateResourceDetectors(writer);
  await populateDependencies(writer);

  const yaml = writer.join();
  process.stdout.write(yaml);
  process.stdout.write("\n");
}

genMetadata();
