const fetch = require('node-fetch');
// server
const parser = require('html-dom-parser');
const express = require('express');

const app = express();
app.use('/client', express.static(__dirname + '/client'));

app.get('/', function(req, res) {
  res.redirect('/client/main.html');
});

app.post('/addKeywords', function(req, res) {
  res.end();
});

app.listen(3100, () => console.log('listening on 3100'));
