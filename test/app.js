'use strict';

var express = require('express');
var laytial = require('../');
var http    = require('http');
var app     = express();

app.set('views', __dirname + '/views');
app.engine('.ejs', require('ejs').__express);
app.set('view engine', 'ejs');

app.use(laytial());

app.get('/no-layout', function(req, res) {
  res.render('hello.ejs', { name: 'Ben', layout: false });
});

app.get('/with-layout', function(req, res) {
  res.render('hello.ejs', { name: 'Ben' });
});

app.get('/specific-layout', function(req, res) {
  res.render('hello.ejs', { name: 'Ben', layout: 'specific-layout' });
});

app.get('/missing-view', function(req, res) {
  res.render('missing-view');
});

app.get('/missing-layout', function(req, res) {
  res.render('hello', { layout: 'missing', name: 'Ben' });
});

app.get('/partial', function(req, res) {
  res.render('include-partial');
});

app.get('/should-error', function(req, res) {
  res.render('viewerror');
});

app.listen(3000);

module.exports = app;