var WebSocketServer = require('ws').Server
var wss             = new WebSocketServer({ port: 8080 });

var DEFAULT_ACCELERATION = 0.75;
var WINDOW = 15;
var lastAccAvg = 0;

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

var lastDeviation = function(array) {
  var average = avg(array);
  var sum = 0;
  array.forEach(function(a) {
    sum += Math.pow(a - average, 2);
  });
  return Math.sqrt(sum / (array.length - 1));
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

  if (lastAcc.length > WINDOW) {
    lastAcc.shift();
  }

  if (lastAcc.length < WINDOW) {
    return;
  }

  var diff = (event.timestamp - lastEvent) / 1000;

  var lastAvg = avg(lastAcc);

  if (event.mod - lastAccAvg < 0) {
    acceleration = lastAccAvg - acceleration;
  }

  var acceleration = lastAvg * 9.81;

  var deviation = lastDeviation(lastAcc);

  if(lastAvg - lastAccAvg < 0) {
    acceleration = - 0.5;
  }
  lastAccAvg = lastAvg;
  if (deviation < 0.04 && event.mod) {
    acceleration = 0;
  } else if (acceleration > 0) {
    acceleration *= DEFAULT_ACCELERATION;
  } else if (acceleration == 0) {
    acceleration = -0.5;
  }

  speed += diff * acceleration

  if (speed < 0) {
    speed = 0;
  }
  console.log({diff: diff, acceleration: acceleration, lastAvg: lastAvg, speed: speed, deviation: deviation });

  var data = event;
  data.speed = speed;
  data.deviation = deviation;
  wss.broadcast(JSON.stringify(data));
  lastEvent = event.timestamp
}

// wss.broadcast(JSON.stringify(data));
