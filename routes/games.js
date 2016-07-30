var express = require('express');
var router = express.Router();

var ObjectId = require('mongoose').Schema.ObjectId;
var Game = require('../models/game').Game;
var Instant = require('../models/instant').Instant;

/* GET users listing. */
router.get('/', function(req, res, next) {
    Game.find(function(err, games) {
        if (err)
            res.send(err);
        res.json(games);
    });
});

router.get('/:id', function(req, res, next) {
    Instant.find({game: ObjectId(req.params.id)}).sort('date').exec(function(err, games) {
        if (err)
            res.send(err);
        res.json(games);
    });
});

module.exports = router;
