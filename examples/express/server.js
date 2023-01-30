'use strict';

const express = require('express');
const axios = require('axios').default;

const app = express();
const PORT = process.env.PORT ?? 8080;

app.get('/animal', async (req, res) => {
  // Calls another endpoint of the same API, mimicing an external API call
  const { data } = await axios.get(`http://localhost:${PORT}/name`, {
    headers: {
      Authorization: 'secret_token',
    },
  });
  const { name } = data;

  return res.json({ animal: 'kangaroo', name });
});

function authMiddleware(req, res, next) {
  const { authorization } = req.headers;
  if (authorization && authorization.includes('secret_token')) {
    next();
  } else {
    res.sendStatus(401);
  }
}

app.get('/name', authMiddleware, function getName(req, res) {
  res.json({ name: 'Spot' }); 
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
