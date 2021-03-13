const { trace } = require('@opentelemetry/api');
const express = require('express')
const axios = require('axios')
const http = require("http")

const app = express()
const port = 3000

app.get('/hello', (req, res) => {
    const tracer = trace.getTracer('example-basic-tracer-node');
    const span = tracer.startSpan('main');
    res.status(201).send("hello from node\n")
    span.end();
})

app.get('/', (req, res) => {
    axios.get('http://localhost:3000/hello')
    .then(response => {
      res.status(201).send("hello from node\n" + response)
    })
    .catch(err => {
      res.status(500).send("hello from node\n" + "error fetching from go")
    }) 

})

app.listen(port, 'localhost', () => console.log(`Example app listening on port ${port}!`))
