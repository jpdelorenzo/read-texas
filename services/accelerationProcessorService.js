var WebSocketServer = require('ws').Server
var wss             = new WebSocketServer({ port: 8080 });

var ObjectId = require('mongoose').Schema.ObjectId;
var Game = require('../models/game').Game;
var Instant = require('../models/instant').Instant;

var DEFAULT_ACCELERATION = 0.75;
var WINDOW = 15;
var game;

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};

var avg = function(array) {
  if (array.length == 0) {
    return 0;
  }
  var sum = 0;
  array.forEach(function(each, i) {
    sum += each;
  })
  return sum / array.length;
}

var lastDeviation = function(array) {
  var average = avg(array);
  var sum = 0;
  array.forEach(function(a) {
    sum += Math.pow(a - average, 2);
  });
  return Math.sqrt(sum / (array.length - 1));
}

exports.startGame = function(name) {
  game = new Game();

  game.name = name;
  game.user = ObjectId(1);

  return game.save();
}

var toDashboardJson = function (timestamp, mod, speed) {
  return JSON.stringify({
    timestamp: timestamp,
    mod: mod,
    speed: speed
  });
}

var createInstant = function(distance, game, speed, acceleration, mod, timestamp) {
  var instant = new Instant();

  instant.distance = distance;
  instant.game = game;
  instant.speed = speed;
  instant.acceleration = acceleration;
  instant.mod = mod;
  instant.timestamp = timestamp;

  return instant;
}

exports.onEvent = function(event) {
  if (!game) {
    game = exports.startGame("Game started at: " + event.timestamp);
  }
  Instant.find({game: game._id}).sort('-date').exec(function(err, instants) {
    var lastAvg = lastEvent = lastDistance = previousSpeed = 0;
    var lastAcc = [];

    if (instants.length > WINDOW) {
      var lastInstant = instants[instants.length - 1];
      lastEvent = lastInstant.timestamp;
      lastAcc = instants.slice(instants.length - WINDOW);
      lastDistance = lastInstant.distance;
      previousSpeed = lastInstant.speed;
    } else {
      var instant = createInstant(0, game._id, 0, 0, event.mod, event.timestamp);
      instant.save();

      wss.broadcast(toDashboardJson(instant.timestamp.getTime(), instant.mod, instant.speed));
      return;
    }

    var diff = (event.timestamp - lastEvent.getTime()) / 1000;
    var lastAvg = avg(lastAcc.map(function(a) { return a.mod }));
    var acceleration = lastAvg * 9.81;
    var deviation = lastDeviation(lastAcc.map(function(a) { return a.mod }));

    if (deviation < 0.04 && event.mod) {
      acceleration = 0;
    } else if (acceleration > 0) {
      acceleration *= DEFAULT_ACCELERATION;
    } else if (acceleration == 0) {
      acceleration = -0.5;
    }

    var newSpeed = previousSpeed + diff * acceleration;
    newSpeed = newSpeed < 0 ? 0 : newSpeed;
    var newDistance = lastDistance + diff * newSpeed;

    var instant = createInstant(newDistance, game._id, newSpeed, acceleration, event.mod, event.timestamp);
    instant.save();

    wss.broadcast(toDashboardJson(instant.timestamp.getTime(), instant.mod, instant.speed));
  });
}
