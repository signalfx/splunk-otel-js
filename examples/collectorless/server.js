'use strict';

// Require in rest of modules
const express = require('express');
const axios = require('axios').default;

// Setup express
const app = express();
const PORT = 8080;

const { log } = require('./utils.js');
const animals = [
  'cats',
  'dogs'
];
const animal = { name: 'Spot' };
const getCrudController = (kind) => {
  const router = express.Router();
  router.get('/', (req, res) => res.send([{ ...animal, kind }]));
  router.post('/', (req, res) => {
    return res.status(201).send({ ...animal, kind });
  });
  return router;
};

const authMiddleware = (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization && authorization.includes('secret_token')) {
    next();
  } else {
    res.sendStatus(401);
  }
};

app.use(express.json());
app.get('/all', async (req, res) => {
  // Calls another endpoint of the same API, somewhat mimicing an external API call
  const results = await Promise.all(animals.map((kind) => {
    return axios.get(`http://localhost:${PORT}/${kind}`, {
      headers: {
        Authorization: 'secret_token',
      },
    }).then((res) => res.data);
  }));
  return res.status(200).send(results.flat());
});
for (const kind of animals) {
  app.use(`/${kind}`, authMiddleware, getCrudController(kind));
}

app.listen(PORT, () => {
  log(`Listening on http://localhost:${PORT}`);
});
