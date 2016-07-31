var WebSocketServer = require('ws').Server
var wss             = new WebSocketServer({ port: 8080 });
var MathService     = require('./MathService');

var ACCELERATION_PERCENTAGE = 0.75;
var WINDOW = 15;
var GRAVITY = 9.81;
var speed, kms, lastEvent, lastAcc;

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};

var calculateAcceleration = function(lastAcc, mod) {
  var lastAvg = MathService.average(lastAcc);
  var deviation = MathService.deviation(lastAcc);

  var acceleration = lastAvg * GRAVITY;
  if (deviation < 0.05 && mod) {
    acceleration = 0;
  } else if (acceleration > 0) {
    acceleration *= ACCELERATION_PERCENTAGE;
  } else if (acceleration == 0) {
    acceleration = -1;
  }

  return acceleration;
}

exports.startGame = function() {
  speed = distance = time = lastEvent = 0;
  lastAcc = [];
}

// event is { timestamp, x, y, z, mod }
exports.onEvent = function(event) {
  if (!lastEvent) {
    exports.startGame();
    lastEvent = event.timestamp;
    return;
  }
  
  lastAcc.push(event.mod);
  if (lastAcc.length > WINDOW) {
    lastAcc.shift();
  } else {
    return;
  }

  var diff = (event.timestamp - lastEvent) / 1000;
  var acceleration = calculateAcceleration(lastAcc, event.mod);

  speed += diff * acceleration;
  speed = speed < 0 ? 0 : speed;
  distance += diff * speed;
  time += diff;

  var data = event;
  data.speed = speed;
  data.distance = distance;
  data.time = time;
  data.resting = acceleration < 0;

  wss.broadcast(JSON.stringify(data));
  console.log(data);
  lastEvent = event.timestamp;
}
