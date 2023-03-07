'use strict';
const axios = require('axios').default;

const SERVER_BASE = process.env.SERVER_BASE ?? 'http://localhost:8080';
const { href } = new URL('/animal', SERVER_BASE);
const { log } = require('./utils.js');
const jitter = () => {
  return (Math.random() * 300) >> 0;
};
const makeRequest = async () => {
  return axios.get(href)
    .then((res) => log('success:', res.statusText))
    .catch((e) => log('failed:', e.message));
};

// interval between regular requests
let interval = 200 + (Math.random() * 5000) >> 0;

// make regular requests
const step = () => {
  makeRequest();
  setTimeout(step, interval + jitter());
};

// change the request interval every now and then
setInterval(() => {
  interval = 200 + (Math.random() * 5000) >> 0;
}, 30000);

step();
