'use strict';

const express = require ('express');
const fs = require ('fs');
const marked = require('marked');

let app = express ();

app.get ('*', (req, res) => {
  res.writeHead (200, { 'Content-Type': 'text/html'});
  let buf = fs.readFileSync ('README.md');
  res.end ('<html><head><title>Neckers Url Shortener Microservice</title></head><body>'
          + marked (buf.toString ())
          + '</body></html>');
});

app.listen (process.env.PORT || 8080);
