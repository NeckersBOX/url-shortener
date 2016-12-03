"use strict";

const db_data = process.env.db_links || require ('./db_data').db;
const mongodb = require ('mongodb').MongoClient;
const express = require ('express');
const fs = require ('fs');
const marked = require('marked');
const co = require('co');

let app = express ();

app.get ('/add/*', (req, res) => {
  res.writeHead (200, { 'Content-Type': 'application/json' });

  /* Check Link */
  if ( req.params[0].length < 3 ) {
    res.end (JSON.stringify ({ error: 'Invalid link' }));
    return;
  }

  let query = Object.keys (req.query).map (k => (
    encodeURIComponent (k) + '=' + encodeURIComponent (req.query[k])
  )).join ('&');
  if ( query.length > 0 )
    query = '?' + query;

  let link = 'http://' + req.params[0] + query;
  if ( /^(http(s)?:\/\/)/.test (req.params[0]) )
    link = req.params[0] + query;

  co (function* () {
    let db = yield mongodb.connect (db_data);
    if ( !db ) {
      res.end (JSON.stringify ({ error: 'Error in mongodb.connect' }));
      return;
    }

    let collection = db.collection ('links');
    let base_url = 'https://shorting.herokuapp.com/';

    /* Check if it already exists */
    let result = yield collection.findOne ({
      original_url: link
    });

    if ( result ) {
      res.end (JSON.stringify ({
        original_url: result.original_url,
        short_url: base_url + result.short_url
      }));

      db.close ();
      return;
    }

    /* Find last id */
    let last_record = yield collection.findOne ({}, { 'sort': { _id: -1 } });

    let next_id = 1;
    if ( last_record )
      next_id = last_record._id + 1;

    let code = next_id.toString (16)

    /* Insert new record */
    collection.insert ({
      _id: next_id,
      original_url: link,
      short_url: code,
      timestamp: Math.floor (new Date ().getTime () / 1000)
    });

    res.end (JSON.stringify ({
      original_url: link,
      short_url: base_url + code
    }));
    db.close ();
  });
});

app.get ('/*', (req, res, next) => {
  if ( /^[0-9a-f]+$/.test (req.params[0]) ) {
    co (function* () {
      let db = yield mongodb.connect (db_data);
      if ( !db ) {
        res.writeHead (200, { 'Content-Type': 'application/json' });
        res.end (JSON.stringify ({ error: 'Error in mongodb.connect' }));
        return;
      }

      let collection = db.collection ('links');
      let base_url = 'https://shorting.herokuapp.com/';

      /* Find Link */
      let result = yield collection.findOne ({
        short_url: req.params[0]
      });

      if ( !result ) {
        res.writeHead (200, { 'Content-Type': 'application/json' });
        res.end (JSON.stringify ({ error: 'Link doesn\'t exists' }));
        return;
      }

      res.redirect (result.original_url);
    });
    return;
  }

  next ();
});

app.get ('*', (req, res) => {
  res.writeHead (200, { 'Content-Type': 'text/html'});

  let buf = fs.readFileSync ('README.md');

  res.end ('<html><head><title>Neckers Url Shortener Microservice</title></head><body>'
          + marked (buf.toString ())
          + '</body></html>');
});

app.listen (process.env.PORT || 8080);
