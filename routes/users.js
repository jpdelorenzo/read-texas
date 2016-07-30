var express = require('express');
var router = express.Router();

var ObjectId = require('mongoose').Schema.ObjectId;
var Game = require('../models/game').Game;

router.post('/', function(req, res, next) {
  res.status(200).json({});
});

router.get('/:id', function(req, res, next) {
  res.status(200).json({});
});

router.get('/:id/games', function(req, res, next) {
  Game.find({user: ObjectId(req.params.id)},function(err, games) {
    if (err)
      res.send(err);
    res.json(games);
  });
});

module.exports = router;
