var WebSocketServer = require('ws').Server
var wss             = new WebSocketServer({ port: 8080 });

var ObjectId = require('mongoose').Schema.ObjectId;
var Game = require('../models/game').Game;
var Instant = require('../models/instant').Instant;

var DEFAULT_ACCELERATION = 0.75;
var WIND_ACCELERATION = 1;
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

var createInstant = function(distance, game, speed, acceleration, mod, time, timestamp) {
  var instant = new Instant();

  instant.distance = distance;
  instant.game = game;
  instant.speed = speed;
  instant.acceleration = acceleration;
  instant.mod = mod;
  instant.time = time;
  instant.timestamp = timestamp;

  return instant;
}

var sendInfo = function(instant) {
  var data = {
    timestamp: instant.timestamp.getTime(),
    mod: instant.mod,
    acceleration: instant.acceleration,
    speed: instant.speed,
    distance: instant.distance,
    time: instant.time
  };
  console.log(data);
  wss.broadcast(JSON.stringify(data));
}

exports.startGame = function(name) {
  game = new Game();

  game.name = name;
  game.user = ObjectId(1);

  return game.save(function(err, savedGame) {
    game = savedGame;
  });
}

exports.onEvent = function(event) {
  if (!game) {
    game = exports.startGame("Game started at: " + event.timestamp);
  } else {
    Instant.find({game: game.id}).sort('-date').exec(function (err, instants) {
      var lastAvg = distance = speed = time = acceleration = 0;

      if (instants.length > WINDOW) {
        var lastInstant = instants[instants.length - 1];
        var lastAcc = instants.slice(instants.length - WINDOW).map(function (a) {
          return a.mod
        });

        distance = lastInstant.distance;
        speed = lastInstant.speed;
        time = lastInstant.time;

        var diff = (event.timestamp - lastInstant.timestamp.getTime()) / 1000;
        var lastAvg = avg(lastAcc);
        var deviation = lastDeviation(lastAcc);

        acceleration = lastAvg * 9.81;

        if (deviation < 0.04 && event.mod) {
          acceleration = -2;
        } else {
          if (acceleration > 0) {
            acceleration *= DEFAULT_ACCELERATION;
          } else if (acceleration = 0) {
            acceleration = -0.5;
          }
          acceleration -= WIND_ACCELERATION;
        }

        speed += diff * acceleration;
        speed = speed < 0 ? 0 : speed;
        distance += diff * speed;
        time += diff;
      }

      var instant = createInstant(distance, game.id, speed, acceleration, event.mod, time, event.timestamp);
      instant.save();
      sendInfo(instant);
    });
  }
}
