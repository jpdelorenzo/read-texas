var WebSocketServer = require('ws').Server
var wss             = new WebSocketServer({ port: 8080 });

var DEFAULT_ACCELERATION = 0.75;

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};

var speed, kms, lastEvent, lastAcc, prevLastAvg;

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

exports.startGame = function() {
  speed = kms = lastEvent = prevLastAvg = 0;
  lastAcc = [];
}

exports.onEvent = function(event) {
  if (lastEvent == undefined) {
    exports.startGame()
  }
  if (lastEvent == 0) {
    lastEvent = event.timestamp;
    return
  }
  lastAcc.push(event.mod);

  if (lastAcc.length > 10) {
    lastAcc.shift();
  }

  if (lastAcc.length < 10) {
    return;
  }

  var diff = (event.timestamp - lastEvent) / 1000;

  var lastAvg = avg(lastAcc);

  var acceleration = lastAvg * 9.81;

  if (acceleration > 0) {
    acceleration *= DEFAULT_ACCELERATION;
  } else if (acceleration == 0) {
    acceleration = -0.5;
  }

  speed += diff * acceleration

  if (speed < 0) {
    speed = 0;
  }
  console.log({diff: diff, acceleration: acceleration, lastAvg: lastAvg, speed: speed})

  var data = event;
  data.speed = speed;
  wss.broadcast(JSON.stringify(data));
  lastEvent = event.timestamp
}

// wss.broadcast(JSON.stringify(data));
