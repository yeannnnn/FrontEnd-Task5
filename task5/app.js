'use strict'
require('dotenv').config();
const express = require('express');
const exif = require('./modules/exif');
const db = require('./modules/database');
const resize = require('./modules/resize');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer({dest: 'public/uploads/'});

const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/modules', express.static('node_modules'));
const connection = db.connect();
const cb = (result, res) => {
  console.log(result);
  res.send(result);
};

// respond to post and save file
app.post('/upload', upload.single('mediafile'), (req, res, next) => {
  next();
});

// create thumbnail
app.use('/upload', (req, res, next) => {
  resize.doResize(req.file.path, 300,
      './public/thumbs/' + req.file.filename + '_thumb', next);
});

// create medium image
app.use('/upload', (req, res, next) => {
  resize.doResize(req.file.path, 640,
      './public/img/' + req.file.filename + '_img', next);
});

// get coordinates
app.use('/upload', (req, res, next) => {
  exif.getCoordinates(req.file.path).then(coords => {
    req.coordinates = coords;
    next();
  }).catch(() => {
    console.log('No coordinates');
    req.coordinates = {};
    next();
  });
});

// insert to database
app.use('/upload', (req, res, next) => {
  console.log('insert is here');
  const data = [
    req.body.category,
    req.body.title,
    req.body.details,
    req.file.filename + '_thumb',
    req.file.filename + '_medium',
    req.file.filename,
    req.coordinates,
  ];
  db.insert(data, connection, next);
});

// get updated data form database and send to client
app.use('/upload', (req, res) => {
  db.select(connection, cb, res);
});

app.get('/images', (req, res) => {
  db.select(connection, cb, res);
});

app.patch('/images', (req, res) => {
  console.log('body', req.body);
  res.send(JSON.stringify(req.body));
});

app.listen(3000);