const { join, dirname } = require("path");
const { access, readFile, constants } = require("node:fs/promises");

const { getInstrumentations } = require('../lib/instrumentations');

const LOADED_INSTRUMENTATIONS = getInstrumentations();

const KNOWN_TARGET_LIBRARY_VERSIONS = new Map([
  ["splunk-opentelemetry-instrumentation-elasticsearch", [">=5 <8"]],
  ["splunk-opentelemetry-instrumentation-kafkajs", [">=0.1.0 <3"]],
  ["splunk-opentelemetry-instrumentation-sequelize", ["*"]],
  ["splunk-opentelemetry-instrumentation-typeorm", [">0.2.28"]],
  ["splunk-opentelemetry-instrumentation-neo4j", [">=4.0.0 <6"]],
  ["splunk-opentelemetry-instrumentation-nocode", ["*"]],
  ["@opentelemetry/instrumentation-dns", ["*"]],
  ["@opentelemetry/instrumentation-net", ["*"]],
  ["@opentelemetry/instrumentation-http",  ["*"]],
  ["@opentelemetry/instrumentation-grpc", ["1.x"]],
  ["@opentelemetry/instrumentation-aws-sdk",  ["2.x", "3.x"]],
  ["@opentelemetry/instrumentation-redis", ["^2.6.0", "3.x"]],
  ["@opentelemetry/instrumentation-lru-memoizer", [">=1.3 <3"]],
  ["@opentelemetry/instrumentation-socket.io", [">=2 <5"]],
  ["@opentelemetry/instrumentation-undici", [">=5.12.0"]],
  ["@fastify/otel", [">=4.0.0 <6"]],
]);

const INSTRUMENTATIONS = [
  { name: "@splunk/otel", target: "node.js runtime", },
  { name: "@opentelemetry/instrumentation-amqplib", target: "amqplib", },
  { name: "@opentelemetry/instrumentation-aws-sdk", target: "aws-sdk and @aws-sdk", },
  { name: "@opentelemetry/instrumentation-bunyan", target: "bunyan", },
  { name: "@opentelemetry/instrumentation-cassandra-driver", target: "cassandra-driver", },
  { name: "@opentelemetry/instrumentation-connect", target: "connect", },
  { name: "@opentelemetry/instrumentation-dataloader", target: "dataloader", },
  { name: "@opentelemetry/instrumentation-dns", target: "dns", },
  { name: "@opentelemetry/instrumentation-express", target: "express", },
  { name: "@fastify/otel", target: "fastify", },
  { name: "@opentelemetry/instrumentation-generic-pool", target: "generic-pool", },
  { name: "@opentelemetry/instrumentation-graphql",  target: "graphql", },
  { name: "@opentelemetry/instrumentation-grpc", target: "@grpc/grpc-js", },
  { name: "@opentelemetry/instrumentation-hapi", target: "hapi", },
  { name: "@opentelemetry/instrumentation-http", target: "http", },
  { name: "@opentelemetry/instrumentation-ioredis", target: "ioredis", },
  { name: "@opentelemetry/instrumentation-kafkajs", target: "kafkajs", },
  { name: "@opentelemetry/instrumentation-knex", target: "knex", },
  { name: "@opentelemetry/instrumentation-koa", target: "koa", },
  { name: "@opentelemetry/instrumentation-lru-memoizer", target: "lru-memoizer", },
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
  { name: "@opentelemetry/instrumentation-restify", target: "restify", },
  { name: "@opentelemetry/instrumentation-router", target: "router", },
  { name: "@opentelemetry/instrumentation-socket.io", target: "socket.io", },
  { name: "@opentelemetry/instrumentation-tedious", target: "tedious", },
  { name: "@opentelemetry/instrumentation-undici", target: "undici", },
  { name: "@opentelemetry/instrumentation-winston", target: "winston", },
  { name: "splunk-opentelemetry-instrumentation-elasticsearch", target: "@elastic/elasticsearch", support: "supported", },
  { name: "splunk-opentelemetry-instrumentation-sequelize", target: "sequelize", support: "supported", },
  { name: "splunk-opentelemetry-instrumentation-typeorm", target: "typeorm", support: "supported", },
  { name: "splunk-opentelemetry-instrumentation-neo4j", target: "neo4j", support: "supported", },
  { name: "splunk-opentelemetry-instrumentation-nocode", target: "nocode", support: "supported", }
];

const INSTRUMENTATION_ADDITIONAL_DATA = new Map([
  ["@splunk/otel", {
    signals: [
      {metrics: [
        {metric_name: "process.runtime.nodejs.event_loop.lag.max", instrument: "histogram", description: "Maximum duration of event loop lag"},
        {metric_name: "process.runtime.nodejs.event_loop.lag.min", instrument: "histogram", description: "Minimum duration of event loop lag"},
        {metric_name: "process.runtime.nodejs.memory.gc.count", instrument: "counter", description: "Garbage collection pause count"},
        {metric_name: "process.runtime.nodejs.memory.gc.pause", instrument: "counter", description: "Garbage collection total time"},
        {metric_name: "process.runtime.nodejs.memory.gc.size", instrument: "counter", description: "Gabrage collection size"},
        {metric_name: "process.runtime.nodejs.memory.heap.total", instrument: "histogram", description: "V8's total memory usage"},
        {metric_name: "process.runtime.nodejs.memory.heap.used", instrument: "histogram", description: "V8's used memory"},
        {metric_name: "process.runtime.nodejs.memory.rss", instrument: "histogram", description: "Process' Resident Set Size"},
      ]},
    ],
  }],
  ["@opentelemetry/instrumentation-http", {
    signals: [
      {metrics: [
        {metric_name: "http.server.duration", instrument: "histogram", description: "Measures the duration of inbound HTTP requests."},
        {metric_name: "http.client.duration", instrument: "histogram", description: "Duration of HTTP client requests."},
        /* Once switched to stable semconv
        {metric_name: "http.server.request.duration", instrument: "histogram", description: "Measures the duration of inbound HTTP requests."},
        {metric_name: "http.client.request.duration", instrument: "histogram", description: "Duration of HTTP client requests."},
        */
      ]},
    ],
  }],
]);

// Output typedef

/**
 * @typedef {Object} Metadata
 * @prop {string} component
 * @prop {string} version
 * @prop {Array<Setting>=} settings
 * @prop {Array<Instrumentation>=} instrumentations
 * @prop {Array<ResourceDetector>=} resource_detectors
 * @prop {Array<DependencyInfo>=} dependencies
 */
/**
 * @typedef {Object} Setting
 * @prop {string} env
 * @prop {string} property
 * @prop {string} description
 * @prop {string} default
 * @prop {string} type
 * @prop {string} category
 */
/**
 * @typedef {Object} Instrumentation
 * @prop {Array<string>} keys
 * @prop {Array<object>} instrumented_components
 * @prop {string} support
 * @prop {string=} stability
 * @prop {Array<object>=} signals
 */
/**
 * @typedef {Object} ResourceDetector
 * @prop {string} key
 * @prop {string} description
 * @prop {Array<object>} attributes
 * @prop {string} support
 */
/**
 * @typedef {Object} DependencyInfo
 * @prop {string} name
 * @prop {string} version
 * @prop {string} stability
 * @prop {string=} source_href
 */

// YAML Formatting
const INDENT = '  ';

/**
 * Convert JS object to YAML string
 *
 * @param {*} input
 * @param {number} objIndent Indent level for objects
 * @returns {string}
 */
function encodeYaml(input, objIndent = 0) {
  if (Array.isArray(input)) {
    // Replace values first line indent with array item indent
    return input.map(item => INDENT.repeat(Math.max(0, objIndent)) + '- ' + encodeYaml(item, objIndent + 1).trimStart())
      .join('\n');
  }

  if (input === null) {
    return 'null';
  }

  switch (typeof input) {
    case 'object':
      return Object.keys(input).map(key => {
        const value = input[key];
        const newline = typeof input[key] === 'object'; // obj/array
        return `${INDENT.repeat(objIndent)}${key}:${newline ? '\n' : ' '}${encodeYaml(value, objIndent + 1)}`;
      }).join('\n');
    case 'undefined':
      return 'undefined';
    case 'boolean':
    case 'number':
    case 'string':
      // Will this break something in some point in the future?
      // ... Yeah probably
      return JSON.stringify(input);
    default:
      return JSON.stringify("(unknown type)");
  }

}

// Metadata fillers

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

  const versionsByInstrumentation = {
    "@splunk/otel": ["See general requirements"],
  };

  versions.forEach((v, i) => {
    versionsByInstrumentation[instrumentations[i].instrumentationName] = v;
  });

  return versionsByInstrumentation;
}

function getSettingsList() {
  const { listEnvVars } = require("../lib");
  return listEnvVars();
}

/** @param {Metadata} metadata */
function populateSettings(metadata) {
  const settings = getSettingsList();

  metadata.settings = settings.map(setting => ({
    env: setting.name,
    property: setting.property,
    description: setting.description,
    default: setting.default,
    type: setting.type,
    category: setting.category,
  }));
}

/** @param {Metadata} metadata */
async function populateInstrumentations(metadata) {
  const versions = await getSupportedLibraryVersions(LOADED_INSTRUMENTATIONS);

  function joinIfArray(value) {
    return Array.isArray(value) ? value.join(',') : value;
  }

  metadata.instrumentations = INSTRUMENTATIONS.map(instrumentation => {
    const instru = {
      keys: [instrumentation.name],
      instrumented_components: [
        {name: instrumentation.target, supported_versions: joinIfArray(versions[instrumentation.name])},
      ],
      support: instrumentation.support ?? "community"
    }

    if (INSTRUMENTATION_ADDITIONAL_DATA.has(instrumentation.name)) {
      Object.assign(instru, INSTRUMENTATION_ADDITIONAL_DATA.get(instrumentation.name));
    }

    return instru;
  })
}

/** @param {Metadata} metadata */
function populateResourceDetectors(metadata) {
  metadata.resource_detectors = [
    {
      key: "PROCESS",
      description: "Process info detector",
      attributes: [
        {id: "process.pid"},
        {id: "process.executable.path"},
        {id: "process.runtime.version"},
        {id: "process.runtime.name"},
      ],
      support: "supported",
    },
    {
      key: "OS",
      description: "Operating system detector",
      attributes: [
        {id: "os.type"},
        {id: "os.description"},
      ],
      support: "supported",
    },
    {
      key: "HOST",
      description: "Host detector",
      attributes: [
        {id: "host.name"},
        {id: "host.arch"},
      ],
      support: "supported",
    },
    {
      key: "CONTAINER",
      description: "Container ID detector",
      attributes: [
        {id: "container.id"},
      ],
      support: "supported",
    },
    {
      key: "DISTRO",
      description: "Distribution version detector",
      attributes: [
        {id: "splunk.distro.version"},
      ],
      support: "supported",
    }
  ];
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

/**
 * @param {string} dependency
 * @param {string} version
 * @returns {DependencyInfo}
 */
async function populateDependencyInfo(dependency, version, writer) {
    const status = isExperimental(dependency, version) ? "experimental" : "stable";

    const pkgJsonPath = await findPackageJson(dependency);

    let url = undefined;

    if (pkgJsonPath) {
      const pkgJson = JSON.parse(await readFile(pkgJsonPath, { encoding: "utf-8" }));
      url = pkgJson.homepage;
    }

    /** @type {DependencyInfo} */
    const info = {
      name: dependency,
      version,
      stability: status,
    }
    if (url) {
      info.source_href = url;
    }
    return info;
}

/** @param {Metadata} metadata */
async function populateDependencies(metadata) {
  const deps = require(join(__dirname, "../package.json")).dependencies;

  const promises = Object.keys(deps).map(dep => populateDependencyInfo(dep, deps[dep]));

  metadata.dependencies = await Promise.all(promises);
}

async function genMetadata() {
  /** @type {Metadata} */
  const metadata = {
    component: "Splunk Distribution of OpenTelemetry JavaScript",
    version: require("../package.json").version,
  }

  populateSettings(metadata);
  await populateInstrumentations(metadata);
  populateResourceDetectors(metadata);
  await populateDependencies(metadata);

  process.stdout.write(encodeYaml(metadata));
  process.stdout.write("\n");
}

genMetadata();
